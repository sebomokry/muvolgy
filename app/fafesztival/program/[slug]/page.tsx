import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DISTRICTS,
  FEATURES,
  KINDS,
  PROGRAMS,
  REGISTRATION_URL,
  dayInfo,
  endTime,
  otherByLeaders,
  programBySlug,
} from "@/lib/fafesztival/data";
import { DAY_COLOR } from "@/components/fafesztival/ui";
import { FavoriteButton } from "@/components/fafesztival/FavoriteButton";
import { AddToCalendar } from "@/components/fafesztival/AddToCalendar";
import { ProgramCard } from "@/components/fafesztival/ProgramCard";

export function generateStaticParams() {
  return PROGRAMS.map((p) => ({ slug: p.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = programBySlug.get(slug);
  if (!p) return {};
  return {
    title: `${p.title} – Budapest Fafesztivál 2026`,
    description: `${dayInfo(p.day).label} ${p.start} · ${p.area}. ${p.description[0].slice(0, 140)}…`,
  };
}

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = programBySlug.get(slug);
  if (!p) notFound();
  const d = dayInfo(p.day);
  const sameSlot = PROGRAMS.filter((q) => q.id !== p.id && q.day === p.day && q.start === p.start);
  const others = otherByLeaders(p);
  const leaderLabel =
    p.leaderLabel ?? (p.leaders.length > 1 ? "Sétavezetők" : p.kind === "seta" ? "Sétavezető" : "Vezeti");

  return (
    <article className="pt-4">
      <Link href="/fafesztival" className="text-sm font-semibold text-ff-olive hover:underline">
        ← Vissza a programhoz
      </Link>

      <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full px-3 py-1 font-bold text-white" style={{ background: DAY_COLOR[p.day] }}>
              {d.label} {d.weekday}
            </span>
            <span className="font-ff-display text-2xl font-bold">
              {p.start}–{p.durationKnown ? "" : "kb. "}
              {endTime(p)}
            </span>
            <span className="rounded-full bg-ff-leaf-soft px-2.5 py-1 text-xs font-semibold text-ff-olive">
              {KINDS[p.kind]}
            </span>
            {p.status === "full" && (
              <span className="rounded-full bg-ff-mauve px-2.5 py-1 text-xs font-bold text-white">Betelt</span>
            )}
          </div>
          <h1 className="mt-3 font-ff-display text-4xl leading-[1.05] font-bold text-ff-ink sm:text-5xl">{p.title}</h1>
          {p.durationNote && <p className="mt-2 text-sm font-semibold text-ff-muted">⏱ {p.durationNote}</p>}

          {p.leaders.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-bold tracking-wider text-ff-muted uppercase">{leaderLabel}</p>
              <ul className="mt-1 space-y-1">
                {p.leaders.map((l) => (
                  <li key={l.name}>
                    <span className="font-bold">{l.name}</span>
                    {l.role && <span className="text-ff-muted">, {l.role}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-5 space-y-3 text-[17px] leading-relaxed">
            {p.description.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {p.features.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {p.features.map((f) => (
                <li key={f} className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold ring-1 ring-ff-olive/15">
                  {FEATURES[f].icon} {FEATURES[f].label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl bg-white p-4 ring-1 ring-ff-olive/10">
            <p className="text-xs font-bold tracking-wider text-ff-muted uppercase">Helyszín</p>
            {p.venue ? (
              <>
                <p className="mt-1 font-ff-display text-xl font-bold">{p.venue.name}</p>
                <p className="text-ff-muted">{p.venue.address}</p>
                <a
                  className="mt-2 inline-block text-sm font-semibold text-ff-olive underline"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.venue.address)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Útvonaltervezés ↗
                </a>
              </>
            ) : (
              <>
                <p className="mt-1 font-ff-display text-xl font-bold">{p.area}</p>
                <p className="text-ff-muted">{DISTRICTS[p.district].name}</p>
                <p className="mt-2 rounded-xl bg-ff-leaf-soft px-3 py-2 text-sm">
                  A pontos kezdőpontot a szervezők a regisztráció után küldik el.
                </p>
              </>
            )}
            <Link
              href={`/fafesztival/terkep?p=${p.slug}`}
              className="mt-2 block text-sm font-semibold text-ff-olive underline"
            >
              Megnézem a térképen
            </Link>
          </div>

          {p.status === "open" && (
            <a
              href={REGISTRATION_URL}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center rounded-full bg-ff-mauve px-5 py-3 font-ff-display text-lg font-semibold tracking-wide text-white uppercase hover:opacity-90"
            >
              Regisztrálok →
            </a>
          )}
          {p.status === "full" && (
            <p className="rounded-full bg-ff-mauve-soft px-5 py-3 text-center font-ff-display text-lg font-semibold tracking-wide text-ff-mauve uppercase">
              Betelt
            </p>
          )}
          {p.status === "noRegistration" && (
            <p className="rounded-2xl bg-ff-leaf-soft px-4 py-3 text-center text-sm font-semibold">
              Ehhez a programhoz nem kell regisztrálni.
            </p>
          )}
          <FavoriteButton id={p.id} size="lg" />
          <AddToCalendar p={p} />
        </aside>
      </div>

      {sameSlot.length > 0 && (
        <section className="mt-10">
          <h2 className="font-ff-display text-2xl font-bold">Ugyanekkor indul még</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {sameSlot.map((q) => (
              <ProgramCard key={q.id} p={q} />
            ))}
          </div>
        </section>
      )}
      {others.length > 0 && (
        <section className="mt-10">
          <h2 className="font-ff-display text-2xl font-bold">További programok tőlük</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {others.map((q) => (
              <ProgramCard key={q.id} p={q} showDay />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
