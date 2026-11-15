import type { ReactNode } from "react";
import PaneCloseButton from "./PaneCloseButton";

interface PaneProps {
  title: string;
  titleRight?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}

export default function Pane({
  title,
  titleRight,
  className,
  contentClassName,
  children,
}: PaneProps) {
  return (
    <section
      aria-label={title}
      data-pane
      data-pane-id={title}
      className={
        "pane-accent overflow-hidden rounded-pane border-2 border-bg3 bg-bg1 " +
        (className ?? "")
      }
    >
      <div
        data-pane-header
        className="flex h-9 shrink-0 items-center justify-between gap-2 border-b-2 border-bg3 bg-bg2/40 px-2"
      >
        <span className="min-w-0 truncate font-mono text-sm text-gray">
          ~/<span>{title}</span>
        </span>
        <div className="flex shrink-0 items-center gap-2">
          {titleRight}
          <span
            data-window-controls
            className="flex items-center gap-1 font-mono text-gray"
          >
            <span aria-hidden="true">─</span>
            <span aria-hidden="true">□</span>
            <PaneCloseButton />
          </span>
        </div>
      </div>
      <div className={contentClassName ?? "p-5"}>{children}</div>
    </section>
  );
}
