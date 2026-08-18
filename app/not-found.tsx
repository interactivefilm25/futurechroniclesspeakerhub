import Link from "next/link";
import { SiteNav } from "./components/site-nav";
import { SiteFooter } from "./components/site-footer";

export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main>
        <div className="wrap page">
          <span className="eyebrow">404</span>
          <h1 className="profile-name">No entry on record.</h1>
          <p style={{ marginTop: "1rem" }}>
            <Link href="/">&larr; Back to the archive</Link>
          </p>
        </div>
        <SiteFooter />
      </main>
    </>
  );
}
