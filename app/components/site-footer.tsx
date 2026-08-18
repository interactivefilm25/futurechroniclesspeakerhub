import { site } from "../lib/content";

export function SiteFooter() {
  const left = site.footerLeft ?? "";
  const idx = left.indexOf("futurechronicles.org");

  return (
    <footer>
      <div className="wrap footer-grid">
        <span>
          {idx >= 0 ? (
            <>
              {left.slice(0, idx)}
              <a href="https://www.futurechronicles.org" target="_blank" rel="noopener">
                futurechronicles.org
              </a>
              {left.slice(idx + "futurechronicles.org".length)}
            </>
          ) : (
            left
          )}
        </span>
        {site.footerRight ? <span>{site.footerRight}</span> : null}
      </div>
    </footer>
  );
}
