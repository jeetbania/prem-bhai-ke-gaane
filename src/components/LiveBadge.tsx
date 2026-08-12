"use client";

import { useEffect, useState } from "react";

// A real, server-tracked count of open tabs across both jukebox sites right
// now (heartbeats every 25s, pruned after 45s of silence) - never a
// fabricated number.
function getSessionId(): string {
  const STORAGE_KEY = "listener-session-id";
  let id = sessionStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

const HEARTBEAT_MS = 25_000;

export default function LiveBadge() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let stopped = false;
    const sessionId = getSessionId();

    const beat = async () => {
      try {
        const res = await fetch("/api/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
          keepalive: true,
        });
        if (!res.ok || stopped) return;
        const data = await res.json();
        if (typeof data.count === "number") setCount(data.count);
      } catch {
        // Network hiccup - keep showing the last known count.
      }
    };

    beat();
    const interval = setInterval(beat, HEARTBEAT_MS);
    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, []);

  if (count === null) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-10 flex justify-center sm:top-6">
      <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-xl backdrop-saturate-150 shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.35)]">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <span>
          {count} {count === 1 ? "person" : "people"} listening now
        </span>
      </div>
    </div>
  );
}
