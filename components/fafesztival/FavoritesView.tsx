"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { DAYS, PROGRAMS, conflictingIds, programById, toMinutes } from "@/lib/fafesztival/data";
import { useFfFavorites } from "@/lib/fafesztival/favorites";
import { ProgramCard } from "./ProgramCard";
import { DAY_COLOR } from "./ui";
import { Check, ICON, ShareNetwork, Warning } from "./icons";

// Shared lists travel in the URL hash: /fafesztival/kedvenceim#k=1,5,12
function subscribeHash(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}
const getHash = () => window.location.hash;
const getServerHash = () => "";

export function FavoritesView() {
  const { selectedIds, addMany } = useFfFavorites();
  const hash = useSyncExternalStore(subscribeHash, getHash, getServerHash);
  const [copied, setCopied] = useState(false);

  const incoming = useMemo(() => {
    const m = hash.match(/k=([\d,]+)/);
    return m
      ? m[1]
          .split(",")
          .map(Number)
          .filter((id) => programById.has(id))
      : [];
  }, [hash]);
  const incomingNew = incoming.filter((id) => !selectedIds.has(id));

  const favs = useMemo(
    () =>
      PROGRAMS.filter((p) => selectedIds.has(p.id)).sort(
        (a, b) => a.day.localeCompare(b.day) || toMinutes(a.start) - toMinutes(b.start),
      ),
    [selectedIds],
  );
  const conflicts = useMemo(() => conflictingIds(favs), [favs]);

  function clearHash() {
    history.replaceState(null, "", window.location.pathname);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }

  async function share() {
    const url = `${window.location.origin}/fafesztival/kedvenceim#k=${favs.map((p) => p.id).join(",")}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Fafesztivál – a programom", url });
        return;
      } catch {
        /* fall through to copy */
      }
    }
    await navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="pt-4">
      <h1 className="font-ff-display text-3xl font-bold sm:text-4xl">Kedvenceim</h1>

      {incoming.length > 0 && (
        <div className="mt-4 bg-ff-mauve-soft p-4">
          <p className="font-semibold text-ff-ink">
            Valaki megosztott veled {incoming.length} programot
            {incomingNew.length < incoming.length
              ? ` (${incoming.length - incomingNew.length} már a kedvenceid között van)`
              : ""}
            .
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {incoming.map((id) => {
              const p = programById.get(id)!;
              return (
                <li key={id}>
                  <span className="font-semibold text-ff-muted">
                    {DAYS.find((d) => d.id === p.day)!.label} {p.start}
                  </span>{" "}
                  · {p.title}
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            {incomingNew.length > 0 && (
              <button
                onClick={() => {
                  addMany(incomingNew);
                  clearHash();
                }}
                className="min-h-11 bg-ff-mauve px-4 py-2 font-semibold text-white hover:opacity-90"
              >
                Hozzáadom a kedvenceimhez
              </button>
            )}
            <button
              onClick={clearHash}
              className="min-h-11 bg-white px-4 py-2 font-semibold text-ff-ink hover:bg-white/70"
            >
              {incomingNew.length > 0 ? "Mégse" : "Rendben"}
            </button>
          </div>
        </div>
      )}

      {favs.length === 0 ? (
        <div className="mt-6 bg-white p-6 text-center ring-1 ring-ff-olive/10">
          <p className="text-ff-muted">
            Még nincs kedvenc programod. A programlistában a csillag gombbal jelölheted meg, amire szeretnél elmenni –
            itt pedig egyben látod a saját programodat, és azt is, ha két program időben ütközik.
          </p>
          <Link
            href="/fafesztival/program"
            className="mt-4 inline-flex min-h-11 items-center bg-ff-olive px-5 py-2.5 font-semibold text-white hover:opacity-90"
          >
            Programok böngészése
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={share}
              className="inline-flex min-h-11 items-center gap-2 bg-ff-olive/10 px-4 py-2 font-semibold text-ff-olive hover:bg-ff-olive/15"
            >
              {copied ? (
                <Check size={ICON.md} weight="bold" aria-hidden />
              ) : (
                <ShareNetwork size={ICON.md} aria-hidden />
              )}
              {copied ? "Link kimásolva" : "Megosztom a listámat"}
            </button>
            {conflicts.size > 0 && (
              <p
                className="inline-flex items-center gap-2 bg-ff-mauve-soft px-4 py-2 text-sm font-semibold text-ff-mauve"
                role="status"
              >
                <Warning size={ICON.md} weight="bold" aria-hidden />
                {conflicts.size} kiválasztott program időben ütközik egy másikkal
              </p>
            )}
          </div>
          {DAYS.filter((d) => favs.some((p) => p.day === d.id)).map((d) => (
            <section key={d.id} className="mt-7">
              <h2 className="mb-3 flex items-baseline gap-2 font-ff-display text-2xl font-bold">
                <span
                  className="inline-block h-3 w-3"
                  style={{ background: DAY_COLOR[d.id] }}
                  aria-hidden
                />
                {d.label} <span className="text-lg font-semibold text-ff-muted">{d.weekday}</span>
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {favs
                  .filter((p) => p.day === d.id)
                  .map((p) => (
                    <ProgramCard key={p.id} p={p} conflict={conflicts.has(p.id)} />
                  ))}
              </div>
            </section>
          ))}
          <p className="mt-6 text-sm text-ff-muted">
            A kedvenceid csak ebben a böngészőben tárolódnak. Az ütközést a megadott vagy (ahol nincs megadva) kb.
            kétórás időtartam alapján jelezzük.
          </p>
        </>
      )}
    </div>
  );
}
