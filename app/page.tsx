import Link from "next/link";
import { SiteNav } from "./components/site-nav";
import { SiteFooter } from "./components/site-footer";
import { Constellation } from "./components/constellation";
import { Plate } from "./components/plate";
import { site, speakers, themes, themeCounts, headlineParts } from "./lib/content";

export default function HomePage() {
  const counts = themeCounts();

  return (
    <>
      <SiteNav />
      <main>
        <section className="hero">
          <Constellation />
          <div className="wrap hero-inner">
            <span className="eyebrow dot-eyebrow hero-eyebrow">{site.heroEyebrow}</span>
            <h1>
              {headlineParts(site.heroHeadline).map((part, i) =>
                part.accent ? <em key={i}>{part.text}</em> : <span key={i}>{part.text}</span>
              )}
            </h1>
            <p className="hero-sub">{site.heroSub}</p>
            <div className="hero-meta">
              <span className="status-pill">
                <span className="status-dot" />
                {site.statusLabel}
              </span>
            </div>
          </div>
        </section>

        <section className="block" id="the-archive">
          <div className="wrap">
            <div className="section-head">
              <h2>{site.archiveHeading}</h2>
              <p className="section-note">
                {speakers.length} {speakers.length === 1 ? "entry" : "entries"} currently on record
              </p>
            </div>
            {speakers.length ? (
              <div className="speaker-grid">
                {speakers.map((s, i) => (
                  <Link key={s.slug} href={`/speakers/${s.slug}`} className="speaker-card">
                    <Plate speaker={s} />
                    <div>
                      <span className="card-index eyebrow">
                        Entry {String(i + 1).padStart(3, "0")}
                      </span>
                      <h3>{s.name}</h3>
                      <p className="speaker-role">{s.role}</p>
                      <div className="card-tags">
                        {s.theme ? <span className="tag theme-tag">{s.theme}</span> : null}
                        {s.location ? <span className="tag">{s.location}</span> : null}
                      </div>
                      <p className="card-summary">{s.summary}</p>
                      <span className="card-link">Read full entry &rarr;</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="review-empty">No entries yet.</p>
            )}
          </div>
        </section>

        <section className="block" id="themes">
          <div className="wrap">
            <div className="section-head">
              <h2>{site.themesHeading}</h2>
              <p className="section-note">{site.themesNote}</p>
            </div>
            <div className="theme-list">
              {themes.map((t) => {
                const n = counts[t] ?? 0;
                return (
                  <div className="theme-row" key={t}>
                    <h3>{t}</h3>
                    <span className={`theme-count${n > 0 ? " has-speaker" : ""}`}>
                      {n === 0
                        ? "Not yet represented"
                        : n === 1
                          ? "1 entry archived"
                          : `${n} entries archived`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="block">
          <div className="wrap cta-block">
            <h2>{site.ctaHeading}</h2>
            <div className="cta-actions">
              <a className="btn" href="mailto:hello@futurechronicles.org">
                Get in touch &rarr;
              </a>
              <p className="cta-note">{site.ctaNote}</p>
            </div>
          </div>
        </section>

        <SiteFooter />
      </main>
    </>
  );
}
