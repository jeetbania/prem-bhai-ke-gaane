import MusicExperience from "@/components/MusicExperience";
import ShareButton from "@/components/ShareButton";
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
// Set this (and redeploy) right before a risky change to warn visitors;
// clear it (and redeploy again) once the change is confirmed working.
const MAINTENANCE_MESSAGE = process.env.MAINTENANCE_MESSAGE ?? "";

const INSTAGRAM_URL = "https://instagram.com/jeetbania";
const X_URL = "https://x.com/figmajeet";
const WEBSITE_URL = "https://jeetcreates.cc";

const iconLinkClass =
  "flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 backdrop-blur-xl backdrop-saturate-150 shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.35)] transition hover:bg-white/20 hover:text-white";

const shareButtonClass =
  "flex h-10 w-10 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-0 text-sm font-medium text-white/90 backdrop-blur-xl backdrop-saturate-150 shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.35)] transition hover:bg-white/20 hover:text-white sm:w-auto sm:px-4";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Background: a portrait-cropped image on small screens, the wide hero on larger ones */}
      <div
        className="fixed inset-0 -z-10 bg-black bg-cover bg-center bg-no-repeat sm:hidden"
        style={{ backgroundImage: "url(/bg-mobile.webp)" }}
      />
      <div
        className="fixed inset-0 -z-10 hidden bg-black bg-cover bg-center bg-no-repeat sm:block"
        style={{ backgroundImage: "url(/bg.webp)" }}
      />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-black/10" />

      <header className="flex items-center justify-between p-4 sm:p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Prem Bhai Ke Gaane"
          className="h-10 w-10 drop-shadow-[0_4px_16px_rgba(0,0,0,0.35)]"
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

      <MusicExperience
        playlistId={PLAYLIST_ID}
        playlistUrl={PLAYLIST_URL}
        maintenanceMessage={MAINTENANCE_MESSAGE}
      />

      {/* Socials: bottom-right corner, same line as the share button */}
      <div className="fixed bottom-4 right-4 z-10 flex items-center gap-2 sm:bottom-6 sm:right-6">
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

      {/* Share: bottom-left corner, same line as the socials */}
      <div className="fixed bottom-4 left-4 z-10 sm:bottom-6 sm:left-6">
        <ShareButton className={shareButtonClass} />
      </div>
    </main>
  );
}
