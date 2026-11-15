import type { Project } from "@/lib/content";
import Pane from "./Pane";
import Reveal from "./Reveal";

const linkClassName =
  "text-green underline-offset-4 transition-colors hover:text-yellow hover:underline focus-visible:text-yellow";

export default function ProjectWindow({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const slug = project.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return (
    <Reveal delay={index * 0.06}>
      <Pane title={"projects/" + slug} className="h-full">
        <h2 className="font-patua_one text-2xl break-words text-fg0">
          {project.title}
        </h2>
        <p className="mt-2 font-sans text-base leading-relaxed text-fg1 md:text-[17px]">
          {project.description}
        </p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {project.tech.map((item) => (
            <li
              key={item}
              className="border border-bg3 bg-bg0 px-2 py-0.5 font-mono text-[13px] text-gray"
            >
              {item}
            </li>
          ))}
        </ul>
        {(project.demo || project.source) && (
          <div className="mt-4 flex gap-3 font-mono text-base">
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClassName}
              >
                [demo] <span aria-hidden="true">↗</span>
              </a>
            )}
            {project.source && (
              <a
                href={project.source}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClassName}
              >
                [src] <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        )}
      </Pane>
    </Reveal>
  );
}
