"use client";

import { useState } from "react";
import Player from "./Player";
import LiveBadge from "./LiveBadge";

export default function MusicExperience({
  playlistId,
  playlistUrl,
}: {
  playlistId: string;
  playlistUrl: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <>
      <LiveBadge active={isPlaying} />

      {/* Player: elevated above the icon row on mobile, centered above the bottom edge on larger screens */}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-10 flex flex-col items-center px-4 sm:bottom-6">
        <div className="pointer-events-auto flex flex-col items-center">
          <Player
            playlistId={playlistId}
            playlistUrl={playlistUrl}
            onPlayingChange={setIsPlaying}
          />
        </div>
      </div>
    </>
  );
}
