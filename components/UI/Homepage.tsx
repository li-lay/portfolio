import Link from "next/link";
import HomeSceneClient from "../3D/HomeSceneClient";
import Typewriter from "./TypeWriter";
import Pane from "./Pane";
import Reveal from "./Reveal";
import { projects } from "@/lib/content";

const ctaClassName =
  "font-mono text-green underline-offset-4 transition-colors hover:text-yellow hover:underline focus-visible:text-yellow";

export default function Home() {
  return (
    <div className="flex flex-col gap-4 pt-6 pb-8 md:pt-8 md:pb-12">
      <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <Reveal className="min-w-0">
          <Pane title="home" className="h-full">
            <div className="font-mono text-sm leading-relaxed md:text-base">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-gray">$ whoami</p>
                  <h1 className="mt-1 font-patua_one text-6xl leading-none text-fg0 md:text-8xl">
                    Lilay
                  </h1>
                  <p className="mt-3 text-base text-aqua md:text-lg">
                    <Typewriter
                      words={["Developer", "DevOps"]}
                      speed={20}
                      wait={6000}
                    />
                  </p>
                </div>
                <picture className="block shrink-0">
                  <source srcSet="/images/pf-640.webp" type="image/webp" />
                  <img
                    src="/images/pf.jpg"
                    alt="Portrait of Lilay"
                    width={120}
                    height={120}
                    loading="eager"
                    fetchPriority="high"
                    className="h-24 w-24 rounded-pane border-2 border-bg3 object-cover md:h-[120px] md:w-[120px]"
                  />
                </picture>
              </div>

              <p className="mt-6 text-gray">$ cat ~/.plan</p>
              <p className="text-fg1">
                Year 4 Computer Science student at Angkor Khemara University
                (AKUKS), based in Kampong Speu, Cambodia.
              </p>

              <p className="mt-5 text-gray">$ ls ~/focus</p>
              <p className="text-fg0">
                DevOps · Linux · Kubernetes · .NET · Neovim
              </p>

              <p className="mt-5 text-gray">$ git status</p>
              <p className="text-fg1">
                open source: topgrade, tealdeer, .dotfiles
              </p>

              <p className="mt-5 text-gray">$ uptime</p>
              <p className="text-fg1">daily-driving Linux since high school</p>

              <p className="mt-5 text-gray">$ _</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm md:text-base">
              <Link href="/projects" className={ctaClassName}>
                [ see projects → ]
              </Link>
              <Link href="/contact" className={ctaClassName}>
                [ get in touch → ]
              </Link>
              <a
                href="https://github.com/li-lay"
                target="_blank"
                rel="noopener noreferrer"
                className={ctaClassName}
              >
                [ github → <span aria-hidden="true">↗</span> ]
              </a>
            </div>
          </Pane>
        </Reveal>

        <Reveal delay={0.08} className="min-w-0">
          <HomeSceneClient />
        </Reveal>
      </div>

      <Reveal delay={0.16}>
        <Pane
          title="ls ~/projects"
          titleRight={
            <Link
              href="/projects"
              className="font-mono text-sm text-fg1 transition-colors hover:text-yellow"
            >
              see all →
            </Link>
          }
        >
          <h2 className="mb-2 font-patua_one text-2xl text-fg0">
            Recent projects
          </h2>
          <ul className="flex flex-col">
            {projects.slice(0, 3).map((project) => (
              <li
                key={project.title}
                className="border-b border-bg3 last:border-0"
              >
                <Link
                  href={project.demo ?? "/projects"}
                  {...(project.demo
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="flex items-center justify-between gap-2 px-1 py-3 font-mono text-base text-fg1 transition-colors hover:bg-bg2/30 hover:text-yellow"
                >
                  <span className="min-w-0 break-words">{project.title}</span>
                  <span aria-hidden="true" className="shrink-0">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Pane>
      </Reveal>
    </div>
  );
}
