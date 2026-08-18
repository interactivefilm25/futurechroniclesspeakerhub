import data from "@/content/site.json";

export type SpeakerLink = { label: string; url: string };

export type Speaker = {
  slug: string;
  initials: string;
  name: string;
  role: string;
  theme: string;
  location: string;
  summary: string;
  bio: string[];
  question: string;
  links: SpeakerLink[];
  /** Data URI or a path under /public. Empty string means "use the initials plate". */
  portrait: string;
};

export type SiteText = {
  brandLine1: string;
  brandLine2: string;
  heroEyebrow: string;
  heroHeadline: string;
  heroSub: string;
  statusLabel: string;
  archiveHeading: string;
  themesHeading: string;
  themesNote: string;
  ctaHeading: string;
  ctaNote: string;
  footerLeft: string;
  footerRight: string;
};

export const site = data.site as SiteText;
export const themes = data.themes as string[];
export const speakers = data.speakers as Speaker[];

export function getSpeaker(slug: string): Speaker | undefined {
  return speakers.find((s) => s.slug === slug);
}

export function themeCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const t of themes) counts[t] = 0;
  for (const s of speakers) if (s.theme) counts[s.theme] = (counts[s.theme] ?? 0) + 1;
  return counts;
}

export function initialsFor(s: Speaker): string {
  if (s.initials) return s.initials;
  const parts = s.name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Renders *word* in the hero headline as an accent-coloured span. */
export function headlineParts(text: string): { text: string; accent: boolean }[] {
  return text.split(/(\*[^*]+\*)/).filter(Boolean).map((chunk) =>
    chunk.startsWith("*") && chunk.endsWith("*")
      ? { text: chunk.slice(1, -1), accent: true }
      : { text: chunk, accent: false }
  );
}
