"use client";

// A small honest "is the music actually playing right now" indicator - it
// only ever reflects this visitor's own player state, never a claim about
// anyone else being on the site.
export default function LiveBadge({ active }: { active: boolean }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-10 flex justify-center sm:top-6">
      <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-xl backdrop-saturate-150 shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.35)]">
        <span className="relative flex h-2 w-2 shrink-0">
          {active ? (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          ) : null}
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${active ? "bg-emerald-400" : "bg-white/40"}`}
          />
        </span>
        <span>{active ? "Now Playing" : "Ready to play"}</span>
      </div>
    </div>
  );
}
