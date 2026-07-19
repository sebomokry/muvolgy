export type Category = {
  id: number;
  name: string;
  color: string;
  order: number;
};

export type Location = {
  id: number;
  name: string;
  city: string | null;
};

export type Program = {
  id: number;
  slug: string;
  name: string;
  /** ISO-ish "YYYY-MM-DD HH:mm:ss", parsed with parseDateTime */
  start: string;
  end: string;
  startTs: number;
  endTs: number;
  /** date key ("YYYY-MM-DD") the program belongs to on the schedule */
  day: string;
  isAllDay: boolean;
  description: string | null;
  location: Location | null;
  categories: Category[];
};

export type FestivalData = {
  days: string[];
  categories: Category[];
  locations: Location[];
  programs: Program[];
};
