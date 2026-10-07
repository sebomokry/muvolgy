import Link from "next/link";
import { DISTRICTS, FEATURES, KINDS, dayInfo, endTime, type Program } from "@/lib/fafesztival/data";
import { DAY_COLOR } from "./ui";
import { FavoriteButton } from "./FavoriteButton";
import { FEATURE_ICON, ICON, MapPin, Warning } from "./icons";

export function ProgramCard({
  p,
  conflict = false,
  showDay = false,
}: {
  p: Program;
  conflict?: boolean;
  showDay?: boolean;
}) {
  const full = p.status === "full";
  return (
    <div
      className={`group relative flex gap-3 rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(47,51,36,0.06)] ring-1 transition-shadow hover:shadow-md has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ff-olive ${
        conflict ? "ring-2 ring-ff-mauve" : "ring-ff-olive/10 hover:ring-ff-olive/25"
      }`}
    >
      <span
        className="absolute top-4 bottom-4 left-0 w-1 rounded-r-full"
        style={{ background: DAY_COLOR[p.day] }}
        aria-hidden
      />
      <div className={`min-w-0 flex-1 pl-1 ${full ? "opacity-75" : ""}`}>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="font-ff-display text-xl leading-none font-bold text-ff-ink">
            {showDay && <span className="mr-1.5 text-ff-muted">{dayInfo(p.day).label}</span>}
            {p.start}
          </span>
          <span className="text-ff-muted">
            –{p.durationKnown ? "" : "kb. "}
            {endTime(p)}
          </span>
          <span className="rounded-full bg-ff-leaf-soft px-2 py-0.5 text-xs font-semibold text-ff-olive">
            {KINDS[p.kind]}
          </span>
          {full && <span className="rounded-full bg-ff-mauve px-2 py-0.5 text-xs font-bold text-white">Betelt</span>}
          {p.status === "noRegistration" && (
            <span className="rounded-full bg-ff-olive px-2 py-0.5 text-xs font-bold text-white">
              Regisztráció nélkül
            </span>
          )}
          {conflict && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-ff-mauve">
              <Warning size={ICON.sm} weight="bold" aria-hidden />
              ütközik
            </span>
          )}
        </div>
        <h3 className="mt-1.5 font-ff-display text-[21px] leading-tight font-semibold text-ff-ink group-hover:text-ff-olive">
          {/* Stretched link: the whole card is clickable, while the favorite
              button (z-10) stays a separate control instead of nesting a
              <button> inside an <a>. Keyboard focus is shown as a ring on
              the whole card (has-[a:focus-visible]) instead of on the text. */}
          <Link
            href={`/fafesztival/program/${p.slug}`}
            className="outline-none after:absolute after:inset-0 after:rounded-2xl"
          >
            {p.title}
          </Link>
        </h3>
        {p.leaders.length > 0 && (
          <p className="mt-1 line-clamp-1 text-sm text-ff-muted">{p.leaders.map((l) => l.name).join(", ")}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="inline-flex items-center gap-1 font-semibold text-ff-ink">
            <MapPin size={ICON.sm} weight="bold" className="shrink-0 text-ff-olive" aria-hidden />
            {p.venue || p.area ? (
              <>
                {p.venue ? p.venue.name : p.area}
                <span className="font-normal text-ff-muted">· {DISTRICTS[p.district].name}</span>
              </>
            ) : (
              DISTRICTS[p.district].name
            )}
          </span>
          {p.features.length > 0 && (
            <span className="flex items-center gap-1.5 text-ff-olive">
              {p.features.map((f) => {
                const Icon = FEATURE_ICON[f];
                return <Icon key={f} size={ICON.md} aria-hidden />;
              })}
              <span className="sr-only">{p.features.map((f) => FEATURES[f].label).join(", ")}</span>
            </span>
          )}
        </div>
      </div>
      <div className="relative z-10">
        <FavoriteButton id={p.id} title={p.title} />
      </div>
    </div>
  );
}
