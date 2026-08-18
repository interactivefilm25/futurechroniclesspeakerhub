import { NextResponse } from "next/server";
import { passwordMatches, createSession } from "@/app/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not set in this deployment." },
      { status: 503 }
    );
  }
  let password = "";
  try {
    ({ password } = await req.json());
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  if (!passwordMatches(password || "")) {
    return NextResponse.json({ error: "That password is not correct." }, { status: 401 });
  }
  await createSession();
  return NextResponse.json({ ok: true });
}
