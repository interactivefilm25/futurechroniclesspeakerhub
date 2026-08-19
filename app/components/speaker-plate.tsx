import { initialsFor, type Speaker } from "../lib/content";

const TONES = ["ink", "rust", "teal", "cream", "sand"] as const;

/** The profile-page portrait block, using the same tone system as the grid tiles. */
export function SpeakerPlate({ speaker, index }: { speaker: Speaker; index: number }) {
  const tone = TONES[index % TONES.length];
  return (
    <div className={`plate plate--${tone}`}>
      {speaker.portrait ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={speaker.portrait} alt={`Portrait of ${speaker.name}`} className="plate-img" />
      ) : (
        <span className="plate-initials" aria-hidden="true">
          {initialsFor(speaker)}
        </span>
      )}
    </div>
  );
}
