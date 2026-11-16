import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Pane from "@/components/UI/Pane";
import { gitLog } from "@/lib/git-log";

export const metadata: Metadata = {
  title: "git log",
};

export default function Log() {
  return (
    <div
      style={{ "--ws-accent": "var(--color-blue)" } as CSSProperties}
      className="mx-auto w-full max-w-3xl pt-6 pb-8 md:pt-8"
    >
      <h1 className="text-center font-patua_one text-4xl text-accent md:text-5xl">
        git log
      </h1>

      <Pane title="log" className="mt-4">
        {gitLog.length > 0 ? (
          <>
            <p className="mb-3 font-mono text-sm text-gray">
              $ git log --oneline --max-count=30
            </p>
            <ol className="flex flex-col gap-1 font-mono text-[13px] md:text-sm">
              {gitLog.map((entry) => (
                <li
                  key={entry.hash}
                  className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3"
                >
                  <span className="shrink-0 text-yellow">{entry.hash}</span>
                  <time
                    dateTime={entry.date}
                    className="shrink-0 text-gray tabular-nums"
                  >
                    {entry.date.slice(0, 10)}
                  </time>
                  <span className="min-w-0 break-words text-fg1">
                    {entry.subject}
                  </span>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <div className="font-mono text-sm leading-relaxed">
            <p className="text-fg1">&lt;no history available&gt;</p>
            <p className="mt-2 text-gray">
              The build ran without a .git directory (shallow CI checkout or an
              exported tarball), so there is nothing to log.
            </p>
          </div>
        )}
      </Pane>
    </div>
  );
}
