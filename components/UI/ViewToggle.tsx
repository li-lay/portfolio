"use client";

import { useEffect, useState } from "react";

type View = "grid" | "list";

export default function ViewToggle() {
  const [view, setView] = useState<View>("grid");

  useEffect(() => {
    if (localStorage.getItem("proj-view") === "list") {
      setView("list");
      document.documentElement.dataset.projView = "list";
    }
  }, []);

  const toggle = () => {
    const next: View = view === "grid" ? "list" : "grid";
    setView(next);
    document.documentElement.dataset.projView = next;
    localStorage.setItem("proj-view", next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={view === "list"}
      aria-label={view === "grid" ? "Show projects as a list" : "Show projects as a grid"}
      className="font-mono text-sm text-green underline-offset-4 transition-colors hover:text-yellow hover:underline focus-visible:text-yellow"
    >
      {view === "grid" ? "[ ls -la ]" : "[ grid ]"}
    </button>
  );
}
