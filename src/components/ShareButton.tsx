"use client";

import { useState } from "react";
import { ShareIcon } from "./Icons";

export default function ShareButton({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: document.title,
      text: "Come listen to this with me.",
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled the share sheet - nothing to do.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied - fail silently.
    }
  };

  return (
    <button type="button" onClick={handleShare} aria-label="Share this page" className={className}>
      <ShareIcon className="h-[18px] w-[18px] shrink-0" />
      <span className="hidden whitespace-nowrap sm:inline">
        {copied ? "Link copied!" : "Share with your friend"}
      </span>
    </button>
  );
}
