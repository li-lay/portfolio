"use client";

import dynamic from "next/dynamic";
import Pane from "@/components/UI/Pane";

const HomeScene = dynamic(() => import("./HomeScene"), {
  ssr: false,
  loading: () => (
    <Pane
      title="bin/tux"
      className="h-full flex flex-col"
      contentClassName="p-0 flex-1 min-h-0"
    >
      <div className="flex h-full min-h-[340px] w-full items-center justify-center md:min-h-[480px]">
        <p className="font-mono text-sm text-gray">[ mounting /dev/tux … ]</p>
      </div>
    </Pane>
  ),
});

export default function HomeSceneClient() {
  return <HomeScene />;
}
