import { initialsFor, type Speaker } from "../lib/content";

/** The square portrait/initials plate. One shape everywhere; `large` only changes its size. */
export function Plate({ speaker, large = false }: { speaker: Speaker; large?: boolean }) {
  const className = large ? "monogram monogram-lg" : "monogram";
  if (speaker.portrait) {
    return (
      <div className={className}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={speaker.portrait} alt={`Portrait of ${speaker.name}`} />
      </div>
    );
  }
  return (
    <div className={className} aria-hidden="true">
      {initialsFor(speaker)}
    </div>
  );
}
