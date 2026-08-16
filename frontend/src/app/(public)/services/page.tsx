import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Radio,
  Sparkles,
  Trophy,
  Video,
  Zap,
} from "lucide-react";

import { getPublicServices } from "@/services/services";
import type { Service } from "@/types/service";

import { resolveMediaUrl } from "@/lib/media";

function getServiceIcon(icon?: string | null) {
  const value = icon?.toLowerCase();

  if (
    value?.includes("radio") ||
    value?.includes("broadcast") ||
    value?.includes("live")
  ) {
    return Radio;
  }

  if (
    value?.includes("trophy") ||
    value?.includes("esport") ||
    value?.includes("tournament")
  ) {
    return Trophy;
  }

  if (
    value?.includes("video") ||
    value?.includes("production") ||
    value?.includes("camera")
  ) {
    return Video;
  }

  if (
    value?.includes("zap") ||
    value?.includes("tech") ||
    value?.includes("digital")
  ) {
    return Zap;
  }

  return Sparkles;
}

export default async function ServicesPage() {
  let services: Service[] = [];

  try {
    services = await getPublicServices();
  } catch {
    services = [];
  }

  const featuredServices = services.filter(
    (service) => service.featured,
  );

  const primaryServices = [
    ...featuredServices,
    ...services.filter(
      (service) => !service.featured,
    ),
  ];

  return (
    <main className="overflow-hidden bg-white text-slate-950 dark:bg-[#05070d] dark:text-white">
      <section className="relative overflow-hidden bg-[#05070d] py-24 text-white sm:py-32">
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-[-30%] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[140px]"
        />

        <div
          aria-hidden="true"
          className="absolute -right-40 bottom-[-20%] h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[130px]"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-blue-300 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,.9)]" />
              What we do
            </div>

            <h1 className="mt-7 text-5xl font-black leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-8xl">
              Production built
              <span className="block text-blue-500">
                for the spotlight.
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              From live broadcasting and esports production to event
              technology, Stream Nepal builds the systems and experiences
              that make events worth watching.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#services"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-500"
              >
                Explore our services
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="/portfolio/projects"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                See our work
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-20 dark:border-white/10 dark:bg-[#05070d]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">
                One production partner
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                More than a stream.
              </h2>
            </div>

            <div className="max-w-3xl">
              <p className="text-xl leading-8 text-slate-700 dark:text-slate-300">
                A successful live event is not just about pressing
                &quot;Go Live&quot;. It is about the cameras, graphics, audio,
                data, operators, storytelling and technical decisions
                working together.
              </p>

              <p className="mt-5 leading-7 text-slate-600 dark:text-slate-400">
                Stream Nepal brings those pieces together into a
                production workflow designed around your event,
                audience and goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="services"
        className="bg-slate-50 py-24 dark:bg-[#080b12]"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">
                Our capabilities
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                What we bring to your event.
              </h2>
            </div>

            <p className="max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
              Our services are managed through the Stream Nepal CMS,
              allowing the public website to stay synchronized with
              the services you offer.
            </p>
          </div>

          {!primaryServices.length ? (
            <div className="mt-12 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center dark:border-white/10 dark:bg-white/[0.03]">
              <Sparkles
                size={30}
                className="mx-auto text-slate-400"
              />

              <h3 className="mt-5 text-xl font-bold">
                Services coming soon
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
                Our service portfolio is being prepared. Please check
                back soon.
              </p>
            </div>
          ) : (
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {primaryServices.map((service, index) => {
                const Icon = getServiceIcon(service.icon);

                return (
                  <Link
                    key={service.id}
                    href={`/services/${service.slug}`}
                    className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-2xl dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]"
                  >
                    <div className="absolute right-0 top-0 h-40 w-40 translate-x-1/3 -translate-y-1/3 rounded-full bg-blue-500/5 blur-3xl transition group-hover:bg-blue-500/15" />

                    {service.image ? (
                      <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-900">
                        <img
                          src={resolveMediaUrl(service.image)}
                          alt={service.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-video items-center justify-center bg-slate-100 dark:bg-slate-900">
                        <Icon
                          size={34}
                          className="text-slate-300 dark:text-slate-700"
                        />
                      </div>
                    )}

                    <div className="relative p-7">
                      <div className="flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                          <Icon size={22} />
                        </div>

                        <div className="flex items-center gap-2">
                          {service.featured && (
                            <span className="rounded-full bg-blue-600/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                              Featured
                            </span>
                          )}

                          <span className="text-xs font-black text-slate-300 dark:text-slate-700">
                            {String(index + 1).padStart(
                              2,
                              "0",
                            )}
                          </span>
                        </div>
                      </div>

                      <h3 className="mt-6 text-2xl font-black tracking-tight">
                        {service.title}
                      </h3>

                      {service.shortDescription && (
                        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                          {service.shortDescription}
                        </p>
                      )}

                      {service.description && (
                        <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-500 dark:text-slate-500">
                          {service.description}
                        </p>
                      )}

                      <div className="mt-7 flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400">
                        View service
                        <ArrowRight
                          size={15}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-24 dark:border-white/10 dark:bg-[#05070d]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">
                Built around your production
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                The details matter.
              </h2>

              <p className="mt-6 max-w-lg leading-7 text-slate-600 dark:text-slate-400">
                Behind every smooth broadcast is a technical workflow
                that has been planned, tested and operated properly.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Multi-camera production",
                "Live streaming",
                "Esports observer systems",
                "Scoreboard & overlays",
                "Live graphics",
                "Event technical support",
                "Social media integration",
                "Post-event highlights",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400">
                    <Check size={14} />
                  </span>

                  <span className="text-sm font-semibold">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {featuredServices.length > 0 && (
        <section className="bg-slate-50 py-24 dark:bg-[#080b12]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="overflow-hidden rounded-[2rem] bg-[#05070d] text-white">
              <div className="grid lg:grid-cols-2">
                <div className="relative min-h-[360px] overflow-hidden">
                  {featuredServices[0].image ? (
                    <img
                      src={resolveMediaUrl(featuredServices[0].image)}
                      alt={featuredServices[0].title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(37,99,235,.5),transparent_40%),linear-gradient(135deg,#0f172a,#020617)]" />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/30 to-[#05070d]" />

                  <div className="absolute left-6 top-6 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs font-bold uppercase tracking-wide backdrop-blur">
                    Featured service
                  </div>
                </div>

                <div className="flex flex-col justify-center p-8 sm:p-12">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
                    Featured
                  </p>

                  <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                    {featuredServices[0].title}
                  </h2>

                  {featuredServices[0].shortDescription && (
                    <p className="mt-5 leading-7 text-slate-300">
                      {featuredServices[0].shortDescription}
                    </p>
                  )}

                  <Link
                    href="#contact"
                    className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
                  >
                    Discuss your production
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section
        id="contact"
        className="bg-white py-28 dark:bg-[#05070d]"
      >
        <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 px-6 py-16 dark:border-white/10 dark:bg-white/[0.03] sm:px-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
              Have an event coming up?
            </p>

            <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
              Let&apos;s build the production behind it.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl leading-7 text-slate-600 dark:text-slate-400">
              Tell us what you are planning and we&apos;ll help you figure
              out the right production setup for your audience.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="mailto:info@streamnepal.com"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-blue-500"
              >
                Start a Conversation
                <ArrowRight size={16} />
              </a>

              <Link
                href="/portfolio/projects"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-7 py-3.5 text-sm font-bold transition hover:bg-white dark:border-white/10 dark:hover:bg-white/5"
              >
                View Our Work
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}