"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import Pane from "@/components/UI/Pane";

const HomeScene = dynamic(() => import("./HomeScene"), {
  ssr: false,
  loading: () => <Shell hint="[ mounting /dev/tux … ]" />,
});

const Shell = ({
  hint,
  children,
}: {
  hint: string;
  children?: React.ReactNode;
}) => (
  <Pane
    title="bin/tux"
    className="h-full flex flex-col"
    contentClassName="p-0 flex-1 min-h-0"
  >
    <div className="flex h-full min-h-[340px] w-full flex-col items-center justify-center gap-3 md:min-h-[480px]">
      <p className="font-mono text-sm text-gray">{hint}</p>
      {children}
    </div>
  </Pane>
);

/**
 * The scene costs four three.js/drei chunks (~285 KB brotli, ~990 KB parsed)
 * plus a 141 KB model. Importing it straight after hydration put ~1 MB of
 * download and a WebGL context on the main thread while the page was still
 * settling — and that is where a phone's INP budget goes.
 *
 * So the import now waits for an idle slot, and only once the pane is on
 * screen. Visitors who asked for less data (`Save-Data`, or effectiveType 3G
 * and below) get a button instead of an automatic megabyte.
 */
const deferredForConnection = () => {
  const conn = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  if (!conn) return false;
  return (
    conn.saveData === true ||
    ["slow-2g", "2g", "3g"].includes(conn.effectiveType ?? "")
  );
};

export default function HomeSceneClient() {
  const [mounted, setMounted] = useState(false);
  const [deferred, setDeferred] = useState(false);
  const [inView, setInView] = useState(false);
  const holder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (deferredForConnection()) {
      setDeferred(true);
      return;
    }

    const el = holder.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0, rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Idle after the pane scrolls into view: hydration and the LCP font swap get
  // the main thread to themselves first.
  useEffect(() => {
    if (deferred || mounted || !inView) return;

    const load = () => setMounted(true);
    const idle = (
      window as Window & {
        requestIdleCallback?: (
          cb: () => void,
          opts?: { timeout: number },
        ) => number;
      }
    ).requestIdleCallback;

    if (idle) {
      const id = idle(load, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    }

    const id = setTimeout(load, 200);
    return () => clearTimeout(id);
  }, [deferred, mounted, inView]);

  return (
    <div ref={holder} className="h-full">
      {mounted ? (
        <HomeScene />
      ) : deferred ? (
        <Shell hint="[ /dev/tux parked · save-data detected ]">
          <button
            type="button"
            onClick={() => setMounted(true)}
            className="rounded-pane border-2 border-bg3 bg-bg1 px-3 py-1.5 font-mono text-sm text-fg1 transition-colors hover:border-yellow hover:text-yellow focus-visible:border-yellow focus-visible:text-yellow"
          >
            mount /dev/tux (1.2 MB)
          </button>
        </Shell>
      ) : (
        <Shell hint="[ mounting /dev/tux … ]" />
      )}
    </div>
  );
}
