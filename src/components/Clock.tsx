"use client";

import { useEffect, useState } from "react";

export default function Clock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () =>
      setTime(
        new Date()
          .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
          .toLowerCase()
      );
    update();
    const id = setInterval(update, 1000 * 15);
    return () => clearInterval(id);
  }, []);

  // Avoid a server/client mismatch by rendering nothing until mounted.
  if (!time) return null;

  return <span className="text-sm text-white/70">{time}</span>;
}
