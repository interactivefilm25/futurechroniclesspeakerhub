import { NextResponse } from "next/server";
import { isLoggedIn } from "@/app/lib/auth";
import { readFile, writeFile, CONTENT_PATH } from "@/app/lib/github";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Always read the live file from GitHub so the editor never shows stale content. */
export async function GET() {
  if (!(await isLoggedIn())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  try {
    const file = await readFile(CONTENT_PATH);
    if (!file) {
      return NextResponse.json({ error: `${CONTENT_PATH} not found in the repo.` }, { status: 404 });
    }
    return NextResponse.json({ content: JSON.parse(file.text), sha: file.sha });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!(await isLoggedIn())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  let body: { content?: unknown; sha?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  if (!body.content || typeof body.content !== "object") {
    return NextResponse.json({ error: "Missing content." }, { status: 400 });
  }

  const text = JSON.stringify(body.content, null, 2) + "\n";
  const b64 = Buffer.from(text, "utf8").toString("base64");

  try {
    // Re-read to get the current sha; if it moved under us, refuse rather than clobber.
    const current = await readFile(CONTENT_PATH);
    if (current && body.sha && current.sha !== body.sha) {
      return NextResponse.json(
        {
          error:
            "Someone else changed the content since you opened this page. Reload to get the latest, then re-apply your edits.",
        },
        { status: 409 }
      );
    }
    const { commit } = await writeFile(
      CONTENT_PATH,
      b64,
      "Update archive content via admin",
      current?.sha
    );
    const after = await readFile(CONTENT_PATH);
    return NextResponse.json({ ok: true, commit, sha: after?.sha });
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === "CONFLICT") {
      return NextResponse.json(
        { error: "The file changed while saving. Reload and try again." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
