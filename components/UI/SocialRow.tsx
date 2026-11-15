import type { SocialLink } from "@/lib/content";

export default function SocialRow({ social }: { social: SocialLink }) {
  const external = !social.url.startsWith("mailto:");

  return (
    <a
      href={social.url}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="flex items-center justify-between border-b border-bg3 px-1 py-4 font-mono text-base text-fg1 underline-offset-4 transition-colors last:border-0 hover:bg-bg2/30 hover:text-yellow hover:underline focus-visible:text-yellow"
    >
      <span className="min-w-0 break-words">
        <span aria-hidden="true" className="mr-2">
          {social.emoji}
        </span>
        <span className="text-green">$ open</span> {social.name.toLowerCase()}
      </span>
      <span aria-hidden="true" className="ml-2 shrink-0">
        →{external && <span className="ml-1">↗</span>}
      </span>
    </a>
  );
}
