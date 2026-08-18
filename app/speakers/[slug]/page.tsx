import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteNav } from "../../components/site-nav";
import { SiteFooter } from "../../components/site-footer";
import { Plate } from "../../components/plate";
import { getSpeaker, speakers } from "../../lib/content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return speakers.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const speaker = getSpeaker(slug);
  if (!speaker) return {};
  return { title: `${speaker.name} — Future Chronicles`, description: speaker.summary };
}

export default async function SpeakerPage({ params }: Props) {
  const { slug } = await params;
  const speaker = getSpeaker(slug);
  if (!speaker) notFound();

  const index = speakers.indexOf(speaker);
  const paragraphs = speaker.bio.length ? speaker.bio : [speaker.summary];

  return (
    <>
      <SiteNav />
      <main>
        <div className="wrap page">
          <Link href="/" className="profile-back">
            &larr; Back to the archive
          </Link>

          <div className="profile-layout">
            <div>
              <div className="profile-meta">
                <span className="tag">Entry {String(index + 1).padStart(3, "0")}</span>
                {speaker.theme ? <span className="tag theme-tag">{speaker.theme}</span> : null}
                {speaker.location ? <span className="tag">{speaker.location}</span> : null}
              </div>

              <h1 className="profile-name">{speaker.name}</h1>
              <p className="profile-role">{speaker.role}</p>

              <div className="profile-body">
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              {speaker.question ? (
                <div className="pullquote">
                  <span className="eyebrow dot-eyebrow">The question they carry</span>
                  <p>&ldquo;{speaker.question}&rdquo;</p>
                </div>
              ) : null}

              {speaker.links.length ? (
                <div className="profile-links">
                  {speaker.links.map((l) => (
                    <a key={l.url} href={l.url} target="_blank" rel="noopener">
                      {l.label} ↗
                    </a>
                  ))}
                </div>
              ) : null}
            </div>

            <div>
              <Plate speaker={speaker} large />
              <dl>
                <div className="side-fact">
                  <dt>Theme</dt>
                  <dd>{speaker.theme || "Not set"}</dd>
                </div>
                <div className="side-fact">
                  <dt>Location</dt>
                  <dd>{speaker.location || "Not set"}</dd>
                </div>
                <div className="side-fact">
                  <dt>Portrait</dt>
                  <dd>{speaker.portrait ? "On file" : "Not yet supplied"}</dd>
                </div>
                <div className="side-fact">
                  <dt>Public links</dt>
                  <dd>{speaker.links.length ? `${speaker.links.length} on file` : "None on file"}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
        <SiteFooter />
      </main>
    </>
  );
}
