"use client";

import { useEffect, useRef, useState } from "react";

// Minimal shape of the bits of the YouTube IFrame Player API we use.
type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  nextVideo: () => void;
  previousVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVideoData: () => { video_id: string; title: string; author: string };
  getPlayerState: () => number;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
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

const PLAYER_ELEMENT_ID = "yt-player-host";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Player({
  playlistId,
  playlistUrl,
}: {
  playlistId: string;
  playlistUrl: string;
}) {
  const playerRef = useRef<YTPlayer | null>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

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

  useEffect(() => {
    function createPlayer() {
      playerRef.current = new window.YT!.Player(PLAYER_ELEMENT_ID, {
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
          },
          onStateChange: (e) => {
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
            // A video in the playlist is unavailable/blocked — skip it.
            setErroredCount((n) => n + 1);
            playerRef.current?.nextVideo();
          },
        },
      });
    }

    if (window.YT?.Player) {
      createPlayer();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = createPlayer;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlistId]);

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
        <div id={PLAYER_ELEMENT_ID} />
      </div>

      <div className="pointer-events-auto flex w-[min(92vw,420px)] items-center gap-3 rounded-2xl border border-white/10 bg-black/40 p-3 shadow-2xl backdrop-blur-md">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white/10">
          {thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnail}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {title || (ready ? "Loading…" : "Connecting…")}
              </p>
              <p className="truncate text-xs text-white/60">{author || " "}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => playerRef.current?.previousVideo()}
                disabled={!ready}
                aria-label="Previous track"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                <PrevIcon />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                disabled={!ready}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition hover:scale-105 disabled:opacity-40"
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
              <button
                type="button"
                onClick={() => playerRef.current?.nextVideo()}
                disabled={!ready}
                aria-label="Next track"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                <NextIcon />
              </button>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <div
              onClick={handleSeek}
              className="h-1 flex-1 cursor-pointer rounded-full bg-white/20"
            >
              <div
                className="h-1 rounded-full bg-white"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="w-16 shrink-0 text-right text-[10px] tabular-nums text-white/50">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {erroredCount > 3 ? (
        <p className="mt-2 text-xs text-white/50">
          Some tracks in the playlist can&apos;t be embedded and are being skipped.{" "}
          <a
            href={playlistUrl}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
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
