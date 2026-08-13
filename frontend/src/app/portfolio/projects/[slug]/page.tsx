import Link from "next/link";
import { notFound } from "next/navigation";

import type { Project } from "@/types/project";

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatDate(
  value: string | null,
) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  ).format(new Date(value));
}

async function getProject(
  slug: string,
): Promise<Project | null> {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001/api";

  try {
    const response = await fetch(
      `${apiUrl}/public/projects/${encodeURIComponent(
        slug,
      )}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    const result = await response.json();

    return result.data ?? null;
  } catch {
    return null;
  }
}

export default async function ProjectDetailPage({
  params,
}: ProjectPageProps) {
  const { slug } = await params;

  const project =
    await getProject(slug);

  if (!project) {
    notFound();
  }

  const formattedDate =
    formatDate(project.projectDate);

  return (
    <main className="bg-white">
      {/* HERO IMAGE */}

      <section className="border-b bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Link
            href="/portfolio/projects"
            className="inline-flex items-center text-sm font-medium text-slate-300 transition hover:text-white"
          >
            ← Back to Projects
          </Link>
        </div>

        <div className="mx-auto max-w-7xl px-6 pb-16 pt-8">
          <div className="overflow-hidden rounded-3xl">
            {project.coverImage ? (
              <img
                src={project.coverImage}
                alt={project.title}
                className="aspect-video w-full object-cover"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center bg-slate-900">
                <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Stream Nepal
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PROJECT INFORMATION */}

      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-wrap items-center gap-2">
            {project.category && (
              <span className="rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-600">
                {project.category}
              </span>
            )}

            {project.featured && (
              <span className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white">
                Featured Project
              </span>
            )}
          </div>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">
            {project.title}
          </h1>

          {project.shortDescription && (
            <p className="mt-6 max-w-3xl text-xl leading-8 text-slate-600">
              {project.shortDescription}
            </p>
          )}

          {/* PROJECT META */}

          <div className="mt-10 grid gap-6 border-y border-slate-200 py-8 sm:grid-cols-2 lg:grid-cols-4">
            {project.client && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Client
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  {project.client}
                </p>
              </div>
            )}

            {project.category && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Category
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  {project.category}
                </p>
              </div>
            )}

            {formattedDate && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Date
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  {formattedDate}
                </p>
              </div>
            )}

            {project.projectUrl && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  External Link
                </p>

                <a
                  href={project.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex font-semibold text-blue-600 hover:text-blue-700"
                >
                  Visit Project →
                </a>
              </div>
            )}
          </div>

          {/* DESCRIPTION */}

          {project.description && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-slate-950">
                About This Project
              </h2>

              <div className="mt-5 max-w-4xl whitespace-pre-line text-lg leading-8 text-slate-600">
                {project.description}
              </div>
            </div>
          )}

          {/* CTA */}

          <div className="mt-16 rounded-2xl bg-slate-50 p-8">
            <h2 className="text-2xl font-bold text-slate-950">
              Interested in working with Stream Nepal?
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              Talk to us about your next tournament,
              live broadcast, event production or
              digital project.
            </p>

            <Link
              href="/portfolio"
              className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Explore Stream Nepal
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}