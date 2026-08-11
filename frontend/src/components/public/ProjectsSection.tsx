import type { PublicProject } from "@/services/public";

interface ProjectsSectionProps {
  projects: PublicProject[];
}

export default function ProjectsSection({
  projects,
}: ProjectsSectionProps) {
  if (!projects.length) {
    return null;
  }

  return (
    <section className="border-t bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
            Our Work
          </p>

          <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
            Selected Projects
          </h2>

          <p className="mt-4 text-lg leading-8 text-slate-600">
            Broadcasts, esports productions and event
            projects delivered by Stream Nepal.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="aspect-video overflow-hidden bg-slate-100">
                {project.coverImage ? (
                  <img
                    src={project.coverImage}
                    alt={project.title}
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Stream Nepal
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                {project.category && (
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                    {project.category}
                  </p>
                )}

                <h3 className="mt-2 text-xl font-bold text-slate-950">
                  {project.title}
                </h3>

                {project.shortDescription && (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                    {project.shortDescription}
                  </p>
                )}

                {project.client && (
                  <p className="mt-4 text-sm text-slate-500">
                    Client:{" "}
                    <span className="font-medium text-slate-700">
                      {project.client}
                    </span>
                  </p>
                )}

                {project.projectDate && (
                  <p className="mt-2 text-sm text-slate-500">
                    {new Date(
                      project.projectDate,
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}

                {project.projectUrl && (
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View project →
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}