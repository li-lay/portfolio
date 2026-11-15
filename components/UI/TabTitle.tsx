"use client";

import { useEffect } from "react";

export default function TabTitle() {
  useEffect(() => {
    const base = document.title;

    const onVisibilityChange = () => {
      document.title = document.hidden ? "[1]+  Stopped  " + base : base;
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.title = base;
    };
  }, []);

  return null;
}
