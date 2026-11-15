import ProjectWindow from "@/components/UI/ProjectWindow";
import { projects } from "@/lib/content";

export default function Projects() {
  return (
    <div className="pt-6 pb-8 md:pt-8">
      <h1 className="mb-6 font-patua_one text-5xl text-yellow md:text-6xl">
        Projects
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <ProjectWindow key={project.title} project={project} index={i} />
        ))}
      </div>
    </div>
  );
}
