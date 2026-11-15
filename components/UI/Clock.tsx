"use client";

import { useEffect, useState } from "react";

const format = (date: Date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function Clock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    let id: ReturnType<typeof setTimeout>;

    const schedule = () => {
      const now = new Date();
      setTime(format(now));
      const untilNextMinute =
        (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 50;
      id = setTimeout(schedule, untilNextMinute);
    };

    schedule();
    return () => clearTimeout(id);
  }, []);

  return (
    <span
      suppressHydrationWarning
      className="hidden font-mono text-sm text-gray sm:inline"
    >
      {time}
    </span>
  );
}
