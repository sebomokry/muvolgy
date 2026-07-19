import { FestivalApp } from "@/components/FestivalApp";
import { getFestivalData } from "@/lib/api";

export default async function Home() {
  const data = await getFestivalData();
  return <FestivalApp data={data} />;
}
