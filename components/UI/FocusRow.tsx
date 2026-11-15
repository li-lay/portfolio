import type { FocusArea } from "@/lib/content";

export default function FocusRow({ area }: { area: FocusArea }) {
  return (
    <div className="border-b border-bg3 py-3 last:border-0">
      <p className="font-mono text-base text-aqua">{area.title}</p>
      <p className="text-[15px] text-fg1">{area.description}</p>
    </div>
  );
}
