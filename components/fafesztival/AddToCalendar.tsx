"use client";

import { REGISTRATION_URL, placeLabel, toMinutes, type Program } from "@/lib/fafesztival/data";
import { CalendarPlus, ICON } from "./icons";

// October 15–17, 2026 is still CEST (DST ends 2026-10-25), i.e. UTC+2 —
// writing UTC times avoids shipping a VTIMEZONE block.
function utcStamp(day: string, minutesLocal: number) {
  const [y, mo, d] = day.split("-").map(Number);
  const dt = new Date(Date.UTC(y, mo - 1, d, 0, minutesLocal - 120));
  return dt
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}
const esc = (s: string) => s.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");

export function AddToCalendar({ p }: { p: Program }) {
  function download() {
    const start = toMinutes(p.start);
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//muvolgyprogi.hu//Fafesztival//HU",
      "BEGIN:VEVENT",
      `UID:fafesztival-2026-${p.slug}@muvolgyprogi.hu`,
      `DTSTAMP:${new Date()
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "")}`,
      `DTSTART:${utcStamp(p.day, start)}`,
      `DTEND:${utcStamp(p.day, start + p.minutes)}`,
      `SUMMARY:${esc(`Budapest Fafesztivál: ${p.title}`)}`,
      `LOCATION:${esc(placeLabel(p))}`,
      `DESCRIPTION:${esc(`${p.description[0]}\n\nRegisztráció: ${REGISTRATION_URL}`)}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ];
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fafesztival-${p.slug}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <button
      onClick={download}
      className="flex min-h-12 w-full items-center justify-center gap-2 bg-ff-olive/10 px-5 py-3 font-ff-display text-lg font-semibold tracking-wide text-ff-olive uppercase hover:bg-ff-olive/15"
    >
      <CalendarPlus size={ICON.lg} aria-hidden />
      Naptárba
    </button>
  );
}
