import Player from "@/components/Player";
import Clock from "@/components/Clock";

// This Server Component reads the env var and passes it down as a prop,
// so it doesn't need to be exposed to the client bundle (no NEXT_PUBLIC_).
const PLAYLIST_ID =
  process.env.YOUTUBE_PLAYLIST_ID ?? "PLxgQoQL27ZHYFbMOmb0mIEQyDp2fBsglu";
const PLAYLIST_URL =
  process.env.YOUTUBE_PLAYLIST_URL ??
  `https://music.youtube.com/playlist?list=${PLAYLIST_ID}`;

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col justify-between">
      <div
        className="fixed inset-0 -z-10 bg-black bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/bg.webp)" }}
      />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

      <header className="flex items-center justify-between p-4 sm:p-6">
        <Clock />
        <a
          href={PLAYLIST_URL}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-white/70 underline-offset-4 hover:text-white hover:underline"
        >
          Open on YouTube Music ↗
        </a>
      </header>

      <footer className="flex justify-center p-4 sm:justify-start sm:p-6">
        <Player playlistId={PLAYLIST_ID} playlistUrl={PLAYLIST_URL} />
      </footer>
    </main>
  );
}
