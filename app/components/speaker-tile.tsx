import Link from "next/link";
import { initialsFor, type Speaker } from "../lib/content";

/**
 * Tone is derived from the index, never randomised — a random tone would
 * differ between the server render and the browser and cause a hydration
 * mismatch. Five tones cycle so a photo-less archive still reads as a
 * deliberate mosaic rather than a grid of blanks.
 */
const TONES = ["ink", "rust", "teal", "cream", "sand"] as const;

/** Every 5th tile is a 2×2 feature block; the rest are squares. */
export function tileSpan(index: number): "feature" | "square" {
  return index % 5 === 0 ? "feature" : "square";
}

export function SpeakerTile({ speaker, index }: { speaker: Speaker; index: number }) {
  const tone = TONES[index % TONES.length];
  const span = tileSpan(index);

  return (
    <Link
      href={`/speakers/${speaker.slug}`}
      className={`tile tile--${span} tile--${tone}`}
      style={{ ["--tile-i" as string]: String(index) }}
    >
      <span className="tile-media">
        {speaker.portrait ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={speaker.portrait} alt="" className="tile-img" />
        ) : (
          <span className="tile-initials" aria-hidden="true">
            {initialsFor(speaker)}
          </span>
        )}
      </span>

      <span className="tile-index">{String(index + 1).padStart(2, "0")}</span>

      <span className="tile-body">
        {speaker.theme ? <span className="tile-theme">{speaker.theme}</span> : null}
        <span className="tile-name">{speaker.name}</span>
        <span className="tile-role">{speaker.role}</span>
        <span className="tile-more">
          Read entry <span aria-hidden="true">→</span>
        </span>
      </span>
    </Link>
  );
}
