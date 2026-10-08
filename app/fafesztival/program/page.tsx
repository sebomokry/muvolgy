import type { Metadata } from "next";
import { ProgramBrowser } from "@/components/fafesztival/ProgramBrowser";

export const metadata: Metadata = { title: "Program – Budapest Fafesztivál 2026" };

export default function FafesztivalProgramPage() {
  return <ProgramBrowser />;
}
