"use client";

// Shown in place of the live-listener badge while a deploy/change is in
// flight, so visitors mid-session get a heads-up instead of just seeing
// something break. Toggled via the MAINTENANCE_MESSAGE env var - set it,
// redeploy, and it appears; clear it and redeploy again to remove it.
export default function MaintenanceBanner({ message }: { message: string }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-10 flex justify-center px-4 sm:top-6">
      <div className="flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/15 px-3 py-1.5 text-xs font-medium text-amber-100 backdrop-blur-xl backdrop-saturate-150 shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.25)]">
        <span className="relative inline-flex h-2 w-2 shrink-0 rounded-full bg-amber-300" />
        <span>{message}</span>
      </div>
    </div>
  );
}
