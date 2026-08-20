"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Speaker, SiteText } from "../lib/content";

type Content = { site: SiteText; themes: string[]; speakers: Speaker[] };
type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

const EMPTY_SPEAKER: Speaker = {
  slug: "", initials: "", name: "", role: "", theme: "", location: "",
  summary: "", bio: [], question: "", links: [], portrait: "",
};

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function initialsFrom(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "??";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}
function missingFor(s: Speaker): string[] {
  const m: string[] = [];
  if (!s.name) m.push("name");
  if (!s.role) m.push("role");
  if (!s.theme) m.push("theme");
  if (!s.location) m.push("location");
  if (!s.summary) m.push("summary");
  if (!s.question) m.push("question");
  if (!s.bio.length) m.push("biography");
  if (!s.portrait) m.push("portrait");
  if (!s.links.length) m.push("links");
  return m;
}

export function AdminEditor() {
  const [content, setContent] = useState<Content | null>(null);
  const [sha, setSha] = useState<string>("");
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/content");
        const data = await res.json();
        if (!res.ok) { setLoadError(data.error || "Could not load content."); return; }
        setContent(data.content);
        setSha(data.sha);
      } catch {
        setLoadError("Could not reach the server.");
      }
    })();
  }, []);

  const update = useCallback((fn: (draft: Content) => void) => {
    setContent((prev) => {
      if (!prev) return prev;
      const next: Content = JSON.parse(JSON.stringify(prev));
      fn(next);
      return next;
    });
    setState("dirty");
    setMessage("");
  }, []);

  const totalMissing = useMemo(
    () => (content ? content.speakers.reduce((n, s) => n + missingFor(s).length, 0) : 0),
    [content]
  );

  async function save() {
    if (!content) return;
    setState("saving");
    setMessage("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, sha }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState("error");
        setMessage(data.error || "Could not save.");
        return;
      }
      setSha(data.sha || "");
      setState("saved");
      setMessage("Saved. The live site rebuilds in about a minute.");
    } catch {
      setState("error");
      setMessage("Could not reach the server.");
    }
  }

  async function uploadPortrait(index: number, file: File) {
    if (!content) return;
    const speaker = content.speakers[index];
    const slug = speaker.slug || slugify(speaker.name) || `entry-${index + 1}`;

    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const max = 800;
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const c = document.createElement("canvas");
          c.width = Math.round(img.width * scale);
          c.height = Math.round(img.height * scale);
          c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
          resolve(c.toDataURL("image/jpeg", 0.85));
        };
        img.onerror = () => reject(new Error("bad image"));
        img.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error("bad file"));
      reader.readAsDataURL(file);
    });

    setState("saving");
    setMessage("Uploading portrait…");
    try {
      const res = await fetch("/api/admin/portrait", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) { setState("error"); setMessage(data.error || "Upload failed."); return; }
      update((d) => { d.speakers[index].portrait = data.path; });
      setState("dirty");
      setMessage("Portrait uploaded. Press Save to attach it to this entry.");
    } catch {
      setState("error");
      setMessage("Could not upload that image.");
    }
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/";
  }

  if (loadError) return <div className="protected-banner">{loadError}</div>;
  if (!content) return <p className="admin-sub">Loading content…</p>;

  const stateLabel =
    state === "saving" ? "Saving…" :
    state === "dirty" ? "Unsaved changes" :
    state === "error" ? "Not saved" :
    state === "saved" ? "All changes saved" : "No changes yet";

  const saveBar = (position: "top" | "bottom") => (
    <div className={position === "bottom" ? "savebar savebar-bottom" : "savebar"}>
      <div className={`savebar-state ${state}`}>
        <span className="dot" />
        {stateLabel}
      </div>
      <div className="admin-row">
        <button className="btn small ghost" type="button" onClick={signOut}>Sign out</button>
        <button className="btn small" type="button" onClick={save}
          disabled={state === "saving" || state === "idle" || state === "saved"}>
          Save &amp; publish
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {saveBar("top")}

      {message ? <div className="protected-banner">{message}</div> : null}

      <details className="admin-panel" open>
        <summary>
          <h3>What still needs content</h3>
          <span className="summary-badges">
            {totalMissing
              ? <span className="tag warn-tag">{totalMissing} item{totalMissing === 1 ? "" : "s"}</span>
              : <span className="tag">All complete</span>}
          </span>
        </summary>
        <div className="admin-body">
          <div className="checklist">
            {content.speakers.map((s, i) => {
              const m = missingFor(s);
              return (
                <div key={i} className={`checklist-item ${m.length ? "todo" : "done"}`}>
                  <span className="mark">{m.length ? "!" : "✓"}</span>
                  <span><strong>{s.name || "Untitled entry"}</strong>{m.length ? ` — needs ${m.join(", ")}` : " — complete"}</span>
                </div>
              );
            })}
          </div>
        </div>
      </details>

      <details className="admin-panel" open>
        <summary>
          <h3>Speaker entries</h3>
          <span className="summary-badges"><span className="tag">{content.speakers.length}</span></span>
        </summary>
        <div className="admin-body">
          {content.speakers.map((s, i) => {
            const m = missingFor(s);
            return (
              <details className="admin-panel" key={i}>
                <summary>
                  <h3>{s.name || "Untitled entry"}</h3>
                  <span className="summary-badges">
                    {s.theme ? <span className="tag theme-tag">{s.theme}</span> : null}
                    {m.length ? <span className="tag warn-tag">{m.length} to complete</span>
                              : <span className="tag">Complete</span>}
                  </span>
                </summary>
                <div className="admin-body">
                  <div className="portrait-editor">
                    <div className="portrait-preview">
                      {s.portrait
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={s.portrait} alt="" />
                        : (s.initials || initialsFrom(s.name))}
                    </div>
                    <div>
                      <label className="eyebrow portrait-label" htmlFor={`portrait-${i}`}>Portrait</label>
                      <input id={`portrait-${i}`} type="file" accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPortrait(i, f); }} />
                      <p className="field-hint">
                        Resized to 800px and committed to <code>public/portraits/</code>. Only add a
                        portrait you have permission to publish.
                      </p>
                      {s.portrait ? (
                        <button type="button" className="btn small ghost danger"
                          onClick={() => update((d) => { d.speakers[i].portrait = ""; })}>
                          Remove portrait
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="field">
                      <label htmlFor={`name-${i}`}>Name</label>
                      <input id={`name-${i}`} value={s.name}
                        onChange={(e) => update((d) => { d.speakers[i].name = e.target.value; })} />
                    </div>
                    <div className="field">
                      <label htmlFor={`init-${i}`}>Initials</label>
                      <input id={`init-${i}`} value={s.initials} placeholder={initialsFrom(s.name)}
                        onChange={(e) => update((d) => { d.speakers[i].initials = e.target.value; })} />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor={`role-${i}`}>Role or title</label>
                    <input id={`role-${i}`} value={s.role}
                      onChange={(e) => update((d) => { d.speakers[i].role = e.target.value; })} />
                  </div>

                  <div className="form-row-2">
                    <div className="field">
                      <label htmlFor={`theme-${i}`}>Theme</label>
                      <select id={`theme-${i}`} value={s.theme}
                        onChange={(e) => update((d) => { d.speakers[i].theme = e.target.value; })}>
                        <option value="">Select…</option>
                        {content.themes.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor={`loc-${i}`}>Location</label>
                      <input id={`loc-${i}`} value={s.location}
                        onChange={(e) => update((d) => { d.speakers[i].location = e.target.value; })} />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor={`sum-${i}`}>Short summary</label>
                    <textarea id={`sum-${i}`} rows={2} value={s.summary}
                      onChange={(e) => update((d) => { d.speakers[i].summary = e.target.value; })} />
                    <p className="field-hint">20–34 words. Shown on the archive card.</p>
                  </div>

                  <div className="field">
                    <label htmlFor={`bio-${i}`}>Biography</label>
                    <textarea id={`bio-${i}`} rows={6} value={s.bio.join("\n\n")}
                      onChange={(e) => update((d) => {
                        d.speakers[i].bio = e.target.value.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
                      })} />
                    <p className="field-hint">One paragraph per block, separated by a blank line.</p>
                  </div>

                  <div className="field">
                    <label htmlFor={`q-${i}`}>The question they carry</label>
                    <textarea id={`q-${i}`} rows={3} value={s.question}
                      onChange={(e) => update((d) => { d.speakers[i].question = e.target.value; })} />
                  </div>

                  <div className="field">
                    <label htmlFor={`links-${i}`}>Public links</label>
                    <textarea id={`links-${i}`} rows={3}
                      value={s.links.map((l) => `${l.label} | ${l.url}`).join("\n")}
                      onChange={(e) => update((d) => {
                        d.speakers[i].links = e.target.value.split("\n").map((line) => {
                          const parts = line.split("|");
                          if (parts.length < 2) return null;
                          const label = parts[0].trim();
                          const url = parts.slice(1).join("|").trim();
                          return label && url ? { label, url } : null;
                        }).filter(Boolean) as Speaker["links"];
                      })} />
                    <p className="field-hint">One per line, as: Label | https://url</p>
                  </div>

                  <div className="field">
                    <label htmlFor={`slug-${i}`}>URL slug</label>
                    <input id={`slug-${i}`} value={s.slug}
                      onChange={(e) => update((d) => { d.speakers[i].slug = slugify(e.target.value); })} />
                    <p className="field-hint">Page address: /speakers/{s.slug || "…"}</p>
                  </div>

                  <div className="admin-row">
                    {i > 0 ? (
                      <button type="button" className="btn small ghost" onClick={() => update((d) => {
                        [d.speakers[i - 1], d.speakers[i]] = [d.speakers[i], d.speakers[i - 1]];
                      })}>↑ Move up</button>
                    ) : null}
                    {i < content.speakers.length - 1 ? (
                      <button type="button" className="btn small ghost" onClick={() => update((d) => {
                        [d.speakers[i + 1], d.speakers[i]] = [d.speakers[i], d.speakers[i + 1]];
                      })}>↓ Move down</button>
                    ) : null}
                    <button type="button" className="btn small ghost danger" onClick={() => {
                      if (confirm(`Delete "${s.name || "this entry"}"?`)) {
                        update((d) => { d.speakers.splice(i, 1); });
                      }
                    }}>Delete entry</button>
                  </div>
                </div>
              </details>
            );
          })}
          <div className="admin-row">
            <button type="button" className="btn small" onClick={() => update((d) => {
              const n = { ...EMPTY_SPEAKER, slug: `new-entry-${d.speakers.length + 1}` };
              d.speakers.push(n);
            })}>+ Add a new entry</button>
          </div>
        </div>
      </details>

      <details className="admin-panel">
        <summary>
          <h3>Programme themes</h3>
          <span className="summary-badges"><span className="tag">{content.themes.length}</span></span>
        </summary>
        <div className="admin-body">
          {content.themes.map((t, i) => (
            <div className="admin-row" key={i}>
              <input className="theme-input" value={t} onChange={(e) => update((d) => {
                const old = d.themes[i];
                d.themes[i] = e.target.value;
                d.speakers.forEach((sp) => { if (sp.theme === old) sp.theme = e.target.value; });
              })} />
              <span className="admin-sub">
                {content.speakers.filter((sp) => sp.theme === t).length} entries
              </span>
              <button type="button" className="btn small ghost danger" onClick={() => update((d) => {
                const removed = d.themes[i];
                d.themes.splice(i, 1);
                d.speakers.forEach((sp) => { if (sp.theme === removed) sp.theme = ""; });
              })}>Remove</button>
            </div>
          ))}
          <div className="admin-row">
            <button type="button" className="btn small"
              onClick={() => update((d) => { d.themes.push("New theme"); })}>+ Add a theme</button>
          </div>
        </div>
      </details>

      <details className="admin-panel">
        <summary>
          <h3>Site text</h3>
          <span className="summary-badges"><span className="tag">Home &amp; footer</span></span>
        </summary>
        <div className="admin-body">
          {([
            ["brandLine1", "Brand line 1"], ["brandLine2", "Brand line 2"],
            ["heroEyebrow", "Hero eyebrow"], ["heroHeadline", "Hero headline"],
            ["heroSub", "Hero paragraph"], ["statusLabel", "Status pill"],
            ["archiveHeading", "Archive heading"], ["themesHeading", "Themes heading"],
            ["themesNote", "Themes note"], ["ctaHeading", "CTA heading"],
            ["ctaNote", "CTA note"], ["footerLeft", "Footer left"], ["footerRight", "Footer right"],
          ] as [keyof SiteText, string][]).map(([key, label]) => (
            <div className="field" key={key}>
              <label htmlFor={`site-${key}`}>{label}</label>
              {key === "heroHeadline" || key === "heroSub" ? (
                <textarea id={`site-${key}`} rows={3} value={content.site[key]}
                  onChange={(e) => update((d) => { d.site[key] = e.target.value; })} />
              ) : (
                <input id={`site-${key}`} value={content.site[key]}
                  onChange={(e) => update((d) => { d.site[key] = e.target.value; })} />
              )}
              {key === "heroHeadline" ? (
                <p className="field-hint">Wrap a word in *asterisks* to colour it with the accent.</p>
              ) : null}
            </div>
          ))}
        </div>
      </details>

      {saveBar("bottom")}
    </div>
  );
}
