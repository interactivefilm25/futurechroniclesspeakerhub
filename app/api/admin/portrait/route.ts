import { NextResponse } from "next/server";
import { isLoggedIn } from "@/app/lib/auth";
import { readFile, writeFile } from "@/app/lib/github";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Commits one portrait as its own file under public/portraits/ and returns the
 * public path to store on the speaker. Keeping images out of site.json stops
 * the content file (and every page that reads it) from ballooning.
 */
export async function POST(req: Request) {
  if (!(await isLoggedIn())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let slug = "";
  let dataUrl = "";
  try {
    ({ slug, dataUrl } = await req.json());
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const safeSlug = String(slug || "").replace(/[^a-z0-9-]/gi, "").toLowerCase();
  if (!safeSlug) return NextResponse.json({ error: "Missing slug." }, { status: 400 });

  const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || "");
  if (!m) return NextResponse.json({ error: "Expected a JPEG, PNG or WebP image." }, { status: 400 });

  const ext = m[1] === "jpeg" ? "jpg" : m[1];
  const b64 = m[2];
  if (Buffer.from(b64, "base64").byteLength > 3_000_000) {
    return NextResponse.json({ error: "That image is too large (max ~3MB)." }, { status: 413 });
  }

  const path = `public/portraits/${safeSlug}.${ext}`;
  try {
    const existing = await readFile(path);
    await writeFile(path, b64, `Add portrait for ${safeSlug}`, existing?.sha);
    return NextResponse.json({ ok: true, path: `/portraits/${safeSlug}.${ext}` });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
