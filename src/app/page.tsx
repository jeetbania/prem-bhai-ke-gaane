import Player from "@/components/Player";
import { GlobeIcon, InstagramIcon, SpotifyIcon, XIcon, YoutubeMusicIcon } from "@/components/Icons";

// This Server Component reads env vars and passes values down as props,
// so nothing needs to be exposed to the client bundle (no NEXT_PUBLIC_).
const PLAYLIST_ID =
  process.env.YOUTUBE_PLAYLIST_ID ?? "PLxgQoQL27ZHYFbMOmb0mIEQyDp2fBsglu";
const PLAYLIST_URL =
  process.env.YOUTUBE_PLAYLIST_URL ??
  `https://music.youtube.com/playlist?list=${PLAYLIST_ID}`;
const SPOTIFY_URL =
  process.env.SPOTIFY_PLAYLIST_URL ??
  "https://open.spotify.com/playlist/1zeentMbIYZfgqzsQ6UlFb";

const INSTAGRAM_URL = "https://instagram.com/jeetbania";
const X_URL = "https://x.com/figmajeet";
const WEBSITE_URL = "https://jeetcreates.cc";

const iconLinkClass =
  "flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 backdrop-blur-xl backdrop-saturate-150 shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.35)] transition hover:bg-white/20 hover:text-white";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <div
        className="fixed inset-0 -z-10 bg-black bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/bg.webp)" }}
      />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-black/10" />

      <header className="flex items-center justify-between p-4 sm:p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Prem Bhai Ke Gaane"
          className="h-10 w-10 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.35)] ring-1 ring-white/25"
        />

        <div className="flex items-center gap-2">
          <a
            href={SPOTIFY_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Open on Spotify"
            className={iconLinkClass}
          >
            <SpotifyIcon className="h-5 w-5" />
          </a>
          <a
            href={PLAYLIST_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Open on YouTube Music"
            className={iconLinkClass}
          >
            <YoutubeMusicIcon className="h-5 w-5" />
          </a>
        </div>
      </header>

      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-10 flex flex-col items-center px-4">
        <div className="pointer-events-auto flex flex-col items-center">
          <Player playlistId={PLAYLIST_ID} playlistUrl={PLAYLIST_URL} />
        </div>
      </div>

      <div className="fixed bottom-24 right-4 z-10 flex items-center gap-2 sm:bottom-6 sm:right-6">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram"
          className={iconLinkClass}
        >
          <InstagramIcon className="h-[18px] w-[18px]" />
        </a>
        <a
          href={X_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="X (Twitter)"
          className={iconLinkClass}
        >
          <XIcon className="h-[18px] w-[18px]" />
        </a>
        <a
          href={WEBSITE_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="Portfolio website"
          className={iconLinkClass}
        >
          <GlobeIcon className="h-[18px] w-[18px]" />
        </a>
      </div>
    </main>
  );
}
