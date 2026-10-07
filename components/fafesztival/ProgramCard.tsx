import Link from "next/link";
import { DISTRICTS, FEATURES, KINDS, dayInfo, endTime, type Program } from "@/lib/fafesztival/data";
import { DAY_COLOR } from "./ui";
import { FavoriteButton } from "./FavoriteButton";

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
      className={`group relative flex gap-3 rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(47,51,36,0.06)] ring-1 transition hover:shadow-md ${
        conflict ? "ring-2 ring-ff-mauve" : "ring-ff-olive/10 hover:ring-ff-olive/25"
      } ${full ? "opacity-75" : ""}`}
    >
      <span
        className="absolute top-4 bottom-4 left-0 w-1 rounded-r-full"
        style={{ background: DAY_COLOR[p.day] }}
        aria-hidden
      />
      <div className="min-w-0 flex-1 pl-1">
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
          {conflict && <span className="text-xs font-bold text-ff-mauve">⚠ ütközik</span>}
        </div>
        <h3 className="mt-1.5 font-ff-display text-[21px] leading-tight font-semibold text-ff-ink group-hover:text-ff-olive">
          {/* Stretched link: the whole card is clickable, while the favorite
              button (z-10) stays a separate control instead of nesting a
              <button> inside an <a>. */}
          <Link href={`/fafesztival/program/${p.slug}`} className="after:absolute after:inset-0 after:rounded-2xl">
            {p.title}
          </Link>
        </h3>
        {p.leaders.length > 0 && (
          <p className="mt-1 line-clamp-1 text-sm text-ff-muted">{p.leaders.map((l) => l.name).join(", ")}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="font-semibold text-ff-ink">
            📍 {p.venue ? p.venue.name : p.area}
            <span className="font-normal text-ff-muted"> · {DISTRICTS[p.district].name}</span>
          </span>
          {p.features.length > 0 && (
            <span className="flex gap-1" aria-label={p.features.map((f) => FEATURES[f].label).join(", ")}>
              {p.features.map((f) => (
                <span key={f} title={FEATURES[f].label}>
                  {FEATURES[f].icon}
                </span>
              ))}
            </span>
          )}
        </div>
      </div>
      <div className="relative z-10">
        <FavoriteButton id={p.id} />
      </div>
    </div>
  );
}
