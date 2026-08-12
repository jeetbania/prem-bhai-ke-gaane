"use client";

import { useEffect, useRef, useState } from "react";
import { ShuffleIcon } from "./Icons";

// Minimal shape of the bits of the YouTube IFrame Player API we use.
type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  nextVideo: () => void;
  previousVideo: () => void;
  playVideoAt: (index: number) => void;
  getPlaylist: () => string[] | undefined;
  getPlaylistIndex: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVideoData: () => { video_id: string; title: string; author: string };
  getPlayerState: () => number;
  destroy: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementOrId: string | HTMLElement,
        options: {
          width: string;
          height: string;
          playerVars: Record<string, string | number>;
          events: {
            onReady: () => void;
            onStateChange: (e: { data: number }) => void;
            onError: (e: { data: number }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Player({
  playlistId,
  playlistUrl,
  onPlayingChange,
}: {
  playlistId: string;
  playlistUrl: string;
  onPlayingChange?: (isPlaying: boolean) => void;
}) {
  const playerRef = useRef<YTPlayer | null>(null);
  const hostContainerRef = useRef<HTMLDivElement | null>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  // Guards the one-time "land on a random track" jump so it only fires once
  // per page load, even though it's attempted from a couple of event hooks.
  const startedOnRandomTrackRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [videoId, setVideoId] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [erroredCount, setErroredCount] = useState(0);

  const refreshMeta = () => {
    const player = playerRef.current;
    if (!player) return;
    const data = player.getVideoData();
    if (data?.video_id) setVideoId(data.video_id);
    if (data?.title) setTitle(data.title);
    if (data?.author) setAuthor(data.author);
  };

  // Once the playlist has actually loaded (getPlaylist() is populated),
  // jump to a random track so every visit doesn't open on the same song.
  // Playing then immediately pausing cues the new track without audibly
  // starting playback for the visitor.
  const jumpToRandomTrackOnce = () => {
    if (startedOnRandomTrackRef.current) return;
    const player = playerRef.current;
    if (!player) return;
    const list = player.getPlaylist?.();
    if (!list || list.length < 2) return;
    startedOnRandomTrackRef.current = true;
    player.playVideoAt(Math.floor(Math.random() * list.length));
    player.pauseVideo();
    refreshMeta();
  };

  const shuffleTrack = () => {
    const player = playerRef.current;
    if (!player) return;
    const list = player.getPlaylist?.();
    if (!list || list.length === 0) {
      player.nextVideo();
      return;
    }
    if (list.length === 1) {
      player.playVideoAt(0);
      return;
    }
    const current = player.getPlaylistIndex?.() ?? -1;
    let next = Math.floor(Math.random() * list.length);
    while (next === current) {
      next = Math.floor(Math.random() * list.length);
    }
    player.playVideoAt(next);
  };

  useEffect(() => {
    // React (especially Strict Mode in dev) can run this effect's
    // mount/cleanup twice. The YouTube API replaces its target DOM node
    // with an iframe as a side effect outside React's control, so a naive
    // "reuse a static id" approach leaves a second player wired to a
    // detached node after the first cleanup runs. Instead we own a fresh
    // host element per invocation and destroy the player on cleanup.
    let stopped = false;

    function createPlayer() {
      if (stopped || !hostContainerRef.current) return;
      hostContainerRef.current.innerHTML = "";
      const host = document.createElement("div");
      hostContainerRef.current.appendChild(host);

      playerRef.current = new window.YT!.Player(host, {
        width: "1",
        height: "1",
        playerVars: {
          listType: "playlist",
          list: playlistId,
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          loop: 1,
        },
        events: {
          onReady: () => {
            setReady(true);
            refreshMeta();
            jumpToRandomTrackOnce();
          },
          onStateChange: (e) => {
            // The playlist can still be empty at onReady - keep trying
            // until getPlaylist() actually has entries.
            jumpToRandomTrackOnce();
            const YT = window.YT!;
            if (e.data === YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              refreshMeta();
            } else if (e.data === YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (e.data === YT.PlayerState.CUED) {
              refreshMeta();
            } else if (e.data === YT.PlayerState.ENDED) {
              setIsPlaying(false);
            }
          },
          onError: () => {
            // A video in the playlist is unavailable/blocked - skip it.
            setErroredCount((n) => n + 1);
            playerRef.current?.nextVideo();
          },
        },
      });
    }

    if (window.YT?.Player) {
      createPlayer();
    } else {
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        createPlayer();
      };
    }

    return () => {
      stopped = true;
      playerRef.current?.destroy?.();
      playerRef.current = null;
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlistId]);

  useEffect(() => {
    onPlayingChange?.(isPlaying);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      progressTimer.current = setInterval(() => {
        const player = playerRef.current;
        if (!player) return;
        setCurrentTime(player.getCurrentTime());
        setDuration(player.getDuration());
      }, 500);
    } else if (progressTimer.current) {
      clearInterval(progressTimer.current);
    }
    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    const player = playerRef.current;
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const player = playerRef.current;
    if (!player || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = (e.clientX - rect.left) / rect.width;
    player.seekTo(fraction * duration, true);
    setCurrentTime(fraction * duration);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const thumbnail = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : null;
  const statusLabel = ready ? "Loading" : "Connecting";

  return (
    <>
      <div
        style={{
          position: "fixed",
          left: -9999,
          top: -9999,
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
        aria-hidden
      >
        <div ref={hostContainerRef} />
      </div>

      <div className="flex w-[min(92vw,500px)] items-center gap-3">
        <div className="relative flex min-w-0 flex-1 items-center gap-3 overflow-hidden rounded-2xl border border-white/25 bg-white/10 p-3 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md backdrop-saturate-150">
          {/* Liquid-glass sheen: soft highlight along the top edge */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/25 via-white/5 to-transparent" />
          <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),inset_0_-1px_1px_rgba(0,0,0,0.15)]" />

          <div className="relative h-14 w-[102px] shrink-0">
            {/* Vinyl disc: spins while playing, mostly visible beside the cover art */}
            <div
              className="absolute left-[46px] top-0 h-14 w-14 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.45)]"
              style={{
                background:
                  "repeating-radial-gradient(circle at 50% 50%, #0c0c0c 0px, #0c0c0c 2px, #2c2c2c 3px, #0c0c0c 4px)",
                animation: "vinyl-spin 2.8s linear infinite",
                animationPlayState: isPlaying ? "running" : "paused",
              }}
            >
              <div className="absolute inset-0 m-auto h-5 w-5 overflow-hidden rounded-full ring-1 ring-black/60">
                {thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbnail} alt="" className="h-full w-full scale-150 object-cover" />
                ) : (
                  <div className="h-full w-full bg-neutral-700" />
                )}
              </div>
              <div className="absolute inset-0 m-auto h-1.5 w-1.5 rounded-full bg-black" />
            </div>

            {/* Cover art: fixed rectangle, sits in front of the disc */}
            <div className="absolute left-0 top-0 h-14 w-14 overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/25 shadow-md">
              {thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumbnail} alt="" className="h-full w-full scale-150 object-cover" />
              ) : null}
            </div>
          </div>

          <div className="relative min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white drop-shadow-sm">
                  {title || `${statusLabel}...`}
                </p>
                <p className="truncate text-xs text-white/70">{author || " "}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => playerRef.current?.previousVideo()}
                  disabled={!ready}
                  aria-label="Previous track"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white disabled:opacity-40"
                >
                  <PrevIcon />
                </button>
                <button
                  type="button"
                  onClick={togglePlay}
                  disabled={!ready}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-md transition hover:scale-105 disabled:opacity-40"
                >
                  {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
                <button
                  type="button"
                  onClick={() => playerRef.current?.nextVideo()}
                  disabled={!ready}
                  aria-label="Next track"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white disabled:opacity-40"
                >
                  <NextIcon />
                </button>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <div
                onClick={handleSeek}
                className="h-1 flex-1 cursor-pointer rounded-full bg-white/25"
              >
                <div className="h-1 rounded-full bg-white" style={{ width: `${progress}%` }} />
              </div>
              <span className="w-16 shrink-0 text-right text-[10px] tabular-nums text-white/60">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={shuffleTrack}
          disabled={!ready}
          aria-label="Shuffle to a random track"
          title="Shuffle"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 backdrop-blur-xl backdrop-saturate-150 shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.35)] transition hover:bg-white/20 hover:text-white disabled:opacity-40"
        >
          <ShuffleIcon className="h-5 w-5" />
        </button>
      </div>

      {erroredCount > 3 ? (
        <p className="relative mt-2 text-center text-xs text-white/60">
          Some tracks in the playlist can&apos;t be embedded and are being skipped.{" "}
          <a href={playlistUrl} target="_blank" rel="noreferrer" className="underline">
            Listen on YouTube Music
          </a>
          .
        </p>
      ) : null}
    </>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 2.5v11l9-5.5-9-5.5z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 2.5h3v11H4v-11zm5 0h3v11H9v-11z" />
    </svg>
  );
}

function PrevIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 3v10h1.5V8.8l6.5 4.2V3l-6.5 4.2V3H4z" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M12 3v10h-1.5V8.8L4 13V3l6.5 4.2V3H12z" />
    </svg>
  );
}
