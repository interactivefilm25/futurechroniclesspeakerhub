import type { Metadata } from "next";
import { SiteNav } from "../components/site-nav";
import { SiteFooter } from "../components/site-footer";
import { isLoggedIn, adminConfigured } from "../lib/auth";
import { LoginForm } from "./login-form";
import { AdminEditor } from "./admin-editor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — Future Chronicles",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const configured = adminConfigured();
  const signedIn = configured && (await isLoggedIn());

  return (
    <>
      <SiteNav />
      <main>
        <div className="wrap page">
          <span className="eyebrow dot-eyebrow">Admin</span>
          <h1 className="admin-title">Archive content</h1>

          {!configured ? (
            <div className="protected-banner">
              <strong>Admin isn&rsquo;t switched on yet.</strong> Add the environment
              variables <code>ADMIN_PASSWORD</code>, <code>GITHUB_TOKEN</code> and{" "}
              <code>GITHUB_REPO</code> in Vercel (Settings → Environment Variables), then
              redeploy. The README explains exactly how.
            </div>
          ) : signedIn ? (
            <AdminEditor />
          ) : (
            <LoginForm />
          )}
        </div>
        <SiteFooter />
      </main>
    </>
  );
}
