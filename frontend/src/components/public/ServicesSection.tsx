import Link from "next/link";

import type { PublicService } from "@/services/public";

interface ServicesSectionProps {
  services: PublicService[];
}

export default function ServicesSection({
  services,
}: ServicesSectionProps) {
  if (!services.length) {
    return null;
  }

  return (
    <section className="border-t bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
            What We Do
          </p>

          <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
            Our Services
          </h2>

          <p className="mt-4 text-lg leading-8 text-slate-600">
            Professional broadcasting, esports production and
            event media solutions built for modern events and
            audiences.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="aspect-video overflow-hidden bg-slate-100">
                {service.image ? (
                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-full w-full object-cover"
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
                <h3 className="text-xl font-bold text-slate-950">
                  {service.title}
                </h3>

                {service.shortDescription && (
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {service.shortDescription}
                  </p>
                )}

                {service.slug && (
                  <Link
                    href={`/services/${service.slug}`}
                    className="mt-5 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Learn more →
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}