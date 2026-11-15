"use client";

import { useEffect, useState } from "react";

function format(ms: number): string {
  const minutes = Math.max(0, Math.floor(ms / 60000));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);

  if (days > 0) return `up ${days}d ${hours}h`;
  if (hours > 0) return `up ${hours}h`;
  return `up ${minutes}m`;
}

export default function Uptime({ builtAt }: { builtAt: string }) {
  const [label, setLabel] = useState<string>("");

  useEffect(() => {
    const built = new Date(builtAt).getTime();
    let id: ReturnType<typeof setTimeout>;

    const tick = () => {
      const now = Date.now();
      setLabel(format(now - built));
      id = setTimeout(tick, 60000 - (now % 60000) + 50);
    };

    tick();
    return () => clearTimeout(id);
  }, [builtAt]);

  return (
    <span
      suppressHydrationWarning
      className="hidden font-mono text-sm text-gray sm:inline"
    >
      {label}
    </span>
  );
}
