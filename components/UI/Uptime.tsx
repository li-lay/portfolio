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

const builtFrom = (builtAt: string): number => new Date(builtAt).getTime();

export default function Uptime({
  builtAt,
  className,
}: {
  builtAt: string;
  /** Overrides the statusline's responsive visibility when reused elsewhere. */
  className?: string;
}) {
  // Seed from the build stamp so the prerendered HTML carries a real value;
  // the effect below takes over on the client. `suppressHydrationWarning`
  // covers the text drift between prerender and hydration.
  const [label, setLabel] = useState<string>(() => {
    const built = builtFrom(builtAt);
    return Number.isFinite(built) ? format(Date.now() - built) : "";
  });

  useEffect(() => {
    const built = builtFrom(builtAt);
    let id: ReturnType<typeof setTimeout>;

    const tick = () => {
      const now = Date.now();
      if (Number.isFinite(built)) setLabel(format(now - built));
      id = setTimeout(tick, 60000 - (now % 60000) + 50);
    };

    tick();
    return () => clearTimeout(id);
  }, [builtAt]);

  return (
    <span
      suppressHydrationWarning
      className={className ?? "hidden font-mono text-sm text-gray sm:inline"}
    >
      {label}
    </span>
  );
}
