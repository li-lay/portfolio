import { Fragment, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import Pane from "@/components/UI/Pane";
import FocusRow from "@/components/UI/FocusRow";
import Uptime from "@/components/UI/Uptime";
import {
  affiliation,
  focusAreas,
  now,
  openSource,
  profile,
  projects,
} from "@/lib/content";

const bodyClassName = "mt-4 text-base leading-relaxed text-fg1 md:text-lg";

const TUX = `   .--.
  |o_o |
  |:_/ |
 //   \\ \\
(|     | )
/'\\_   _/\`\\
\\___)=(___/`;

const builtAt = process.env.NEXT_PUBLIC_BUILD_TIME ?? "";
const buildDate = builtAt.slice(0, 10) || "dev";

const neofetch: Array<[string, ReactNode]> = [
  ["OS", "lilay.dev · Next.js 15"],
  ["Host", "Cloudflare"],
  ["Kernel", buildDate],
  ["Shell", "fish"],
  ["DE", "Gruvbox Web"],
  ["Terminal", "kitty"],
  ["Languages", "Python, JS, TS, .NET"],
  ["Projects", String(projects.length)],
  // Same live clock as the statusline, not a frozen string.
  ["Uptime", <Uptime key="uptime" builtAt={builtAt} className="inline" />],
  ["Location", profile.location],
];

export default function About() {
  return (
    <div
      style={{ "--ws-accent": "var(--color-green)" } as CSSProperties}
      className="flex flex-col gap-4 pt-6 pb-8 md:pt-8"
    >
      <h1 className="font-patua_one text-5xl text-accent md:text-6xl">
        About Me
      </h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Pane title="about">
          <p className="font-mono text-base">
            <a
              href={affiliation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green underline-offset-4 transition-colors hover:text-yellow hover:underline focus-visible:text-yellow"
            >
              {affiliation.label} · {affiliation.name}
            </a>{" "}
            <span aria-hidden="true">↗</span>
          </p>
          <p className={bodyClassName}>
            Based in Kampong Speu, Cambodia. A Linux enthusiast and homelabber,
            focused on open-source maintenance and hardware tinkering.
          </p>
          <p className={bodyClassName}>
            I&apos;m a Year 4 Computer Science student at Angkor Khemara
            University (AKUKS). My go-to languages include{" "}
            <span className="text-aqua">Python</span>,{" "}
            <span className="text-blue">JS</span>/
            <span className="text-blue">TS</span>, and frameworks like{" "}
            <span className="text-purple">React</span>/
            <span className="text-purple">NextJS</span>, and I use
            containerization with <span className="text-green">Docker</span>,
            orchestration with <span className="text-blue">Kubernetes</span>, and{" "}
            <span className="text-purple">.NET</span> on the backend plus{" "}
            <span className="text-green">cloud</span> servers.
          </p>
          <p className={bodyClassName}>
            Beyond the code, I&apos;m constantly chasing what interests me (not
            just tech) and sharing knowledge with friends and the community.
            I&apos;m pumped to join forces on projects that shake things up and
            make a real difference!
          </p>
          <p className="mt-4 font-mono text-sm text-gray">
            <span className="text-green">now</span> {now}
          </p>
        </Pane>

        <Pane title="focus">
          <h2 className="mb-2 font-patua_one text-2xl text-fg0">
            What I focus on
          </h2>
          {focusAreas.map((area) => (
            <FocusRow key={area.title} area={area} />
          ))}
        </Pane>
      </div>

      <Pane title="neofetch">
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          <pre
            aria-hidden="true"
            className="shrink-0 overflow-x-auto text-[11px] leading-tight text-green md:text-xs"
          >
            {TUX}
          </pre>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[11px] leading-tight md:text-xs">
            {neofetch.map(([key, value]) => (
              <Fragment key={key}>
                <dt className="text-yellow">{key}</dt>
                <dd className="break-words text-fg1">{value}</dd>
              </Fragment>
            ))}
          </dl>
        </div>
        <p className="mt-3 font-mono text-xs md:text-sm">
          <Link
            href="/log"
            className="text-green underline-offset-4 transition-colors hover:text-yellow hover:underline focus-visible:text-yellow"
          >
            [ git log ]
          </Link>{" "}
          <span className="text-gray">the real commit history</span>
        </p>
      </Pane>

      <Pane title="oss">
        <h2 className="font-patua_one text-2xl text-fg0">Open Source</h2>
        <p className="mt-1 font-mono text-sm text-gray">$ ls ~/oss</p>
        <ul className="mt-2 flex flex-col">
          {openSource.map((item) => (
            <li
              key={item.name}
              className="border-b border-bg3 py-3 last:border-0"
            >
              <p className="font-mono text-base break-words text-aqua">
                {item.url ? (
                  <>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green underline-offset-4 transition-colors hover:text-yellow hover:underline focus-visible:text-yellow"
                    >
                      {item.name}
                    </a>{" "}
                    <span aria-hidden="true">↗</span>
                  </>
                ) : (
                  item.name
                )}
              </p>
              <p className="text-[15px] text-fg1">{item.description}</p>
            </li>
          ))}
        </ul>
      </Pane>
    </div>
  );
}
