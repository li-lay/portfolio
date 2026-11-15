import type { CSSProperties } from "react";
import ProjectWindow from "@/components/UI/ProjectWindow";
import ViewToggle from "@/components/UI/ViewToggle";
import { projects } from "@/lib/content";

export default function Projects() {
  return (
    <div
      style={{ "--ws-accent": "var(--color-blue)" } as CSSProperties}
      className="pt-6 pb-8 md:pt-8"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-patua_one text-5xl text-accent md:text-6xl">
          Projects
        </h1>
        <ViewToggle />
      </div>
      <div className="project-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <ProjectWindow key={project.title} project={project} index={i} />
        ))}
      </div>
    </div>
  );
}
