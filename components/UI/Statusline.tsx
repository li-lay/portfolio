"use client";

import WorkspaceTabs from "./WorkspaceTabs";
import Clock from "./Clock";

export default function Statusline() {
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex h-12 items-center justify-between gap-2 border-b-2 border-yellow-dim bg-bg-hard">
      <WorkspaceTabs />
      <div className="flex h-full items-center gap-3 pr-2">
        <span className="hidden font-mono text-sm text-gray sm:inline">
          lilay@akuks
        </span>
        <Clock />
        <span className="bg-green px-1 font-mono text-sm text-bg0">NORMAL</span>
      </div>
    </div>
  );
}
