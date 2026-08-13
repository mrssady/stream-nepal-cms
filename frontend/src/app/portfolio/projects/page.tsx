import Link from "next/link";

import type { Project } from "@/types/project";

function formatDate(
  value: string | null,
) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(new Date(value));
}

async function getPublicProjects(): Promise<
  Project[]
> {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001/api";

  try {
    const response = await fetch(
      `${apiUrl}/public/projects`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return [];
    }

    const result = await response.json();

    return result.data ?? [];
  } catch {
    return [];
  }
}

export default async function ProjectsPage() {
  const projects =
    await getPublicProjects();

  const featuredProjects =
    projects.filter(
      (project) =>
        project.featured,
    );

  return (
    <main className="bg-white">
      {/* HERO */}

      <section className="border-b bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
              Stream Nepal
            </p>

            <h1 className="mt-3 text-5xl font-bold tracking-tight text-slate-950">
              Our Projects
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Explore selected productions,
              broadcasts, tournaments and
              digital projects delivered by
              Stream Nepal.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED */}

      {featuredProjects.length > 0 && (
        <section className="border-b py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                Featured Work
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Selected Projects
              </h2>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {featuredProjects.map(
                (project) => (
                  <article
                    key={project.id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <Link
                      href={`/portfolio/projects/${project.slug}`}
                    >
                      <div className="aspect-video overflow-hidden bg-slate-100">
                        {project.coverImage ? (
                          <img
                            src={
                              project.coverImage
                            }
                            alt={
                              project.title
                            }
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                              Stream Nepal
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-7">
                        <div className="flex flex-wrap items-center gap-2">
                          {project.category && (
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
                              {
                                project.category
                              }
                            </span>
                          )}

                          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                            Featured
                          </span>
                        </div>

                        <h3 className="mt-4 text-2xl font-bold text-slate-950">
                          {
                            project.title
                          }
                        </h3>

                        {project.shortDescription && (
                          <p className="mt-3 line-clamp-3 leading-7 text-slate-600">
                            {
                              project.shortDescription
                            }
                          </p>
                        )}

                        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                          {project.client && (
                            <span>
                              Client:{" "}
                              <strong className="font-medium text-slate-700">
                                {
                                  project.client
                                }
                              </strong>
                            </span>
                          )}

                          {project.projectDate && (
                            <span>
                              {formatDate(
                                project.projectDate,
                              )}
                            </span>
                          )}
                        </div>

                        <div className="mt-6 inline-flex text-sm font-semibold text-blue-600">
                          View Project →
                        </div>
                      </div>
                    </Link>
                  </article>
                ),
              )}
            </div>
          </div>
        </section>
      )}

      {/* ALL PROJECTS */}

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              Portfolio
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              All Projects
            </h2>

            <p className="mt-3 max-w-2xl text-slate-600">
              A collection of our work across
              esports, live broadcasting,
              tournaments and digital
              production.
            </p>
          </div>

          {!projects.length ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-16 text-center">
              <h2 className="text-2xl font-bold text-slate-950">
                No projects available
              </h2>

              <p className="mt-3 text-slate-600">
                Our portfolio will be updated
                soon.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {projects.map(
                (project) => (
                  <article
                    key={project.id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <Link
                      href={`/portfolio/projects/${project.slug}`}
                    >
                      <div className="aspect-video overflow-hidden bg-slate-100">
                        {project.coverImage ? (
                          <img
                            src={
                              project.coverImage
                            }
                            alt={
                              project.title
                            }
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                              Stream Nepal
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <div className="flex flex-wrap items-center gap-2">
                          {project.category && (
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
                              {
                                project.category
                              }
                            </span>
                          )}

                          {project.featured && (
                            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                              Featured
                            </span>
                          )}
                        </div>

                        <h3 className="mt-4 text-xl font-bold text-slate-950">
                          {
                            project.title
                          }
                        </h3>

                        {project.shortDescription && (
                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                            {
                              project.shortDescription
                            }
                          </p>
                        )}

                        <div className="mt-5 space-y-1 text-sm text-slate-500">
                          {project.client && (
                            <p>
                              Client:{" "}
                              <span className="font-medium text-slate-700">
                                {
                                  project.client
                                }
                              </span>
                            </p>
                          )}

                          {project.projectDate && (
                            <p>
                              Date:{" "}
                              <span className="font-medium text-slate-700">
                                {formatDate(
                                  project.projectDate,
                                )}
                              </span>
                            </p>
                          )}
                        </div>

                        <div className="mt-6 text-sm font-semibold text-blue-600">
                          View Project →
                        </div>
                      </div>
                    </Link>
                  </article>
                ),
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}