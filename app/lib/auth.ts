import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "fc_admin";

function adminPassword(): string | null {
  const p = process.env.ADMIN_PASSWORD;
  return p && p.length > 0 ? p : null;
}

/** Deterministic token derived from the password, so we store no session state. */
function tokenFor(password: string): string {
  return createHmac("sha256", password).update("future-chronicles-admin-v1").digest("hex");
}

export function passwordMatches(candidate: string): boolean {
  const real = adminPassword();
  if (!real) return false;
  const a = Buffer.from(tokenFor(real));
  const b = Buffer.from(tokenFor(candidate));
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function createSession() {
  const real = adminPassword();
  if (!real) throw new Error("ADMIN_PASSWORD is not set");
  const jar = await cookies();
  jar.set(COOKIE, tokenFor(real), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function isLoggedIn(): Promise<boolean> {
  const real = adminPassword();
  if (!real) return false;
  const jar = await cookies();
  const got = jar.get(COOKIE)?.value;
  if (!got) return false;
  const a = Buffer.from(got);
  const b = Buffer.from(tokenFor(real));
  return a.length === b.length && timingSafeEqual(a, b);
}

export function adminConfigured(): boolean {
  return Boolean(
    process.env.ADMIN_PASSWORD && process.env.GITHUB_TOKEN && process.env.GITHUB_REPO
  );
}
