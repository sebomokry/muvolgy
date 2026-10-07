"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  DAYS,
  DISTRICTS,
  PROGRAMS,
  dayInfo,
  programBySlug,
  toMinutes,
  type Day,
  type Program,
} from "@/lib/fafesztival/data";
import { DAY_COLOR, DAY_HEX } from "./ui";
import { ICON, MapPin } from "./icons";

type DayChoice = Day | "all";
type Spot = {
  key: string;
  exact: boolean;
  title: string;
  subtitle: string;
  lat: number;
  lng: number;
  programs: Program[];
};

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const byTime = (a: Program, b: Program) => a.day.localeCompare(b.day) || toMinutes(a.start) - toMinutes(b.start);

/** Exact venues get their own spot; every walk collapses into its district (meeting points stay private). */
function spotsFor(programs: Program[]): Spot[] {
  const map = new Map<string, Spot>();
  for (const p of programs) {
    const key = p.venue ? `v:${p.venue.name}` : `d:${p.district}`;
    let s = map.get(key);
    if (!s) {
      s = p.venue
        ? {
            key,
            exact: true,
            title: p.venue.name,
            subtitle: p.venue.address,
            lat: p.venue.lat,
            lng: p.venue.lng,
            programs: [],
          }
        : {
            key,
            exact: false,
            title: DISTRICTS[p.district].name,
            subtitle: "",
            lat: DISTRICTS[p.district].lat,
            lng: DISTRICTS[p.district].lng,
            programs: [],
          };
      map.set(key, s);
    }
    s.programs.push(p);
  }
  for (const s of map.values()) {
    s.programs.sort(byTime);
    if (!s.exact) {
      const areas = [...new Set(s.programs.flatMap((p) => (p.area ? [p.area] : [])))];
      s.subtitle = areas.length ? areas.join(", ") : "kerületi szintű jelölés";
    }
  }
  return [...map.values()];
}

function popupHtml(s: Spot) {
  const items = s.programs
    .map(
      (p) => `<li style="margin:6px 0;line-height:1.25">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${DAY_HEX[p.day]};margin-right:6px"></span>
        <b>${dayInfo(p.day).label} ${p.start}</b>${p.status === "full" ? ' <span style="color:#8e5e6a;font-weight:700">· Betelt</span>' : ""}<br>
        <a href="/fafesztival/program/${p.slug}" style="color:#5f6440;font-weight:700">${esc(p.title)}</a>
        ${s.exact || !p.area ? "" : `<br><span style="color:#5e6155">${esc(p.area)}</span>`}
      </li>`,
    )
    .join("");
  return `<div style="font-family:var(--font-ff-body),sans-serif;max-width:260px">
    <div style="font-family:var(--font-ff-display),sans-serif;font-size:19px;font-weight:700;color:#2f3324">${esc(s.title)}</div>
    <div style="color:#5e6155;font-size:12.5px">${esc(s.subtitle)}</div>
    <ul style="list-style:none;padding:0;margin:6px 0 0">${items}</ul>
    ${s.exact ? "" : '<div style="margin-top:6px;font-size:12px;color:#5e6155;font-style:italic">Kerületi szintű jelölés – a pontos kezdőpontot a regisztráció után küldik el.</div>'}
  </div>`;
}

function iconFor(s: Spot) {
  const days = [...new Set(s.programs.map((p) => p.day))];
  if (s.exact) {
    const c = DAY_HEX[days[0]];
    return L.divIcon({
      className: "",
      iconSize: [34, 44],
      iconAnchor: [17, 42],
      popupAnchor: [0, -38],
      html: `<div style="position:relative;width:34px;height:44px">
        <svg width="34" height="44" viewBox="0 0 34 44"><path d="M17 43C17 43 32 27 32 16A15 15 0 0 0 2 16C2 27 17 43 17 43Z" fill="${c}" stroke="#fff" stroke-width="2.5"/></svg>
        <span style="position:absolute;top:7px;left:0;width:34px;text-align:center;color:#fff;font:700 13px var(--font-ff-display),sans-serif">${days.map((d) => dayInfo(d).short).join("/")}</span>
      </div>`,
    });
  }
  const ring = days.length === 1 ? DAY_HEX[days[0]] : "#5f6440";
  const dots = days
    .map(
      (d) =>
        `<span style="width:7px;height:7px;border-radius:50%;background:${DAY_HEX[d]};display:inline-block"></span>`,
    )
    .join("");
  // Compact count badge so neighbouring districts don't collide at city zoom;
  // the district name is revealed by CSS (.ff-map-zoomed) once zoomed in.
  return L.divIcon({
    className: "",
    iconSize: [0, 0],
    html: `<div class="ff-badge" style="border-color:${ring}">
      <b>${s.programs.length}</b><span class="ff-badge-dots">${dots}</span><span class="ff-badge-label">${esc(s.title.replace(" kerület", " ker."))}</span>
    </div>`,
  });
}

export default function MapView() {
  // Client-only (loaded with ssr:false), so reading the URL here is safe.
  const [focusSlug] = useState(() => new URLSearchParams(window.location.search).get("p"));
  const focusProgram = focusSlug ? programBySlug.get(focusSlug) : undefined;
  const [day, setDay] = useState<DayChoice>(focusProgram?.day ?? "all");

  const spots = useMemo(() => spotsFor(PROGRAMS.filter((p) => day === "all" || p.day === day)), [day]);

  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef(new Map<string, L.Marker>());

  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, { scrollWheelZoom: false, zoomControl: true }).setView([47.497, 19.06], 11);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
    const syncZoomClass = () => map.getContainer().classList.toggle("ff-map-zoomed", map.getZoom() >= 12);
    map.on("zoomend", syncZoomClass);
    syncZoomClass();
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current,
      layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    markersRef.current.clear();
    for (const s of spots) {
      if (!s.exact) {
        L.circle([s.lat, s.lng], {
          radius: 1300,
          color: "#5f6440",
          weight: 1.5,
          dashArray: "4 6",
          fillColor: "#b9cf9c",
          fillOpacity: 0.28,
        }).addTo(layer);
      }
      const m = L.marker([s.lat, s.lng], { icon: iconFor(s), zIndexOffset: s.exact ? 1000 : 0 })
        .bindPopup(popupHtml(s), { maxWidth: 280 })
        .addTo(layer);
      markersRef.current.set(s.key, m);
    }
    const focus = focusProgram && spots.find((s) => s.programs.some((p) => p.id === focusProgram.id));
    if (focus) {
      map.setView([focus.lat, focus.lng], focus.exact ? 15 : 13);
      markersRef.current.get(focus.key)?.openPopup();
    } else if (spots.length) {
      map.fitBounds(L.latLngBounds(spots.map((s) => [s.lat, s.lng] as [number, number])), {
        padding: [30, 30],
        maxZoom: 13,
      });
    }
  }, [spots, focusProgram]);

  function flyTo(s: Spot) {
    const map = mapRef.current;
    if (!map) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) map.setView([s.lat, s.lng], s.exact ? 15 : 13);
    else map.flyTo([s.lat, s.lng], s.exact ? 15 : 13, { duration: 0.6 });
    markersRef.current.get(s.key)?.openPopup();
    elRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  }

  const sortedSpots = [...spots].sort(
    (a, b) => Number(b.exact) - Number(a.exact) || a.title.localeCompare(b.title, "hu", { numeric: true }),
  );

  return (
    <div className="pt-4">
      <h1 className="font-ff-display text-3xl font-bold sm:text-4xl">Térkép</h1>
      <p className="mt-1 max-w-2xl text-ff-muted">
        A séták kezdőpontját a szervezők a regisztráció után küldik el, ezért ezeket csak kerületi szinten jelöljük.
        Tűvel csak azok a helyszínek szerepelnek, amelyeket a program pontosan megad.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {([{ id: "all", label: "Mind" }, ...DAYS] as { id: DayChoice; label: string }[]).map((d) => {
          const on = day === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setDay(d.id)}
              className={`inline-flex min-h-10 items-center rounded-full px-3.5 py-1.5 text-sm font-bold transition-colors ${on ? "text-white" : "bg-ff-olive/8 text-ff-olive hover:bg-ff-olive/15"}`}
              style={on ? { background: d.id === "all" ? "var(--ff-olive)" : DAY_COLOR[d.id] } : undefined}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      <div
        ref={elRef}
        className="relative z-0 mt-3 h-[62vh] min-h-[360px] overflow-hidden rounded-3xl ring-1 ring-ff-olive/15"
      />

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ff-muted">
        {DAYS.map((d) => (
          <span key={d.id} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: DAY_COLOR[d.id] }} /> {d.label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-ff-olive bg-white text-[11px] font-bold text-ff-ink">
            3
          </span>
          séták száma a kerületben (kerületi szint)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={ICON.md} weight="fill" className="text-ff-olive" aria-hidden />
          pontos helyszín
        </span>
      </div>

      <h2 className="mt-8 font-ff-display text-2xl font-bold">Helyszínek és kerületek</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {sortedSpots.map((s) => (
          <div key={s.key} className="rounded-2xl bg-white p-4 ring-1 ring-ff-olive/10">
            <button
              onClick={() => flyTo(s)}
              className="min-h-11 text-left"
              aria-label={`${s.title} megmutatása a térképen`}
            >
              <span className="inline-flex items-center gap-1.5 font-ff-display text-xl font-bold hover:text-ff-olive">
                {s.exact && <MapPin size={ICON.md} weight="fill" className="text-ff-olive" aria-hidden />}
                {s.title}
              </span>
              <span className="block text-sm text-ff-muted">{s.subtitle}</span>
            </button>
            <ul className="mt-2 space-y-1.5">
              {s.programs.map((p) => (
                <li key={p.id} className="flex items-baseline gap-2 text-sm">
                  <span
                    className="h-2 w-2 shrink-0 translate-y-[-1px] rounded-full"
                    style={{ background: DAY_COLOR[p.day] }}
                  />
                  <span className="shrink-0 font-semibold text-ff-muted">
                    {dayInfo(p.day).label} {p.start}
                  </span>
                  <Link
                    href={`/fafesztival/program/${p.slug}`}
                    className="font-semibold text-ff-ink hover:text-ff-olive hover:underline"
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
