import type { ReactNode } from "react";

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
      className={
        "overflow-hidden rounded-pane border-2 border-bg3 bg-bg1 " +
        (className ?? "")
      }
    >
      <div className="flex h-9 shrink-0 items-center justify-between gap-2 border-b-2 border-bg3 bg-bg2/40 px-2">
        <span className="min-w-0 truncate font-mono text-sm text-gray">
          ~/<span>{title}</span>
        </span>
        <div className="flex shrink-0 items-center gap-2">
          {titleRight}
          <span aria-hidden="true" className="font-mono text-gray">
            ─ □ ×
          </span>
        </div>
      </div>
      <div className={contentClassName ?? "p-5"}>{children}</div>
    </section>
  );
}
