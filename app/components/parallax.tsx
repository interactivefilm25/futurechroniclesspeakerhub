"use client";

import { useEffect, useRef } from "react";

/**
 * Translates its children vertically as the page scrolls, proportional to how
 * far the element is from the viewport centre. `speed` > 0 makes the element
 * trail the scroll (classic background parallax); < 0 makes it lead. `clamp`
 * caps the offset in px so layers never drift into each other. Renders inert
 * under prefers-reduced-motion.
 */
export function Parallax({
  speed = 0.1,
  clamp = 48,
  mode = "center",
  className,
  children,
}: {
  speed?: number;
  clamp?: number;
  /** "center": offset from viewport centre (grid tiles). "scroll": raw scroll
   *  distance (hero layers) — starts at exactly 0 on load. */
  mode?: "center" | "scroll";
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const applied = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      let delta;
      if (mode === "scroll") {
        delta = window.scrollY;
      } else {
        const rect = el.getBoundingClientRect();
        // subtract our own translate so the measurement is of the layout position
        const baseCentre = rect.top - applied.current + rect.height / 2;
        delta = window.innerHeight / 2 - baseCentre;
      }
      let y = delta * speed;
      if (y > clamp) y = clamp;
      if (y < -clamp) y = -clamp;
      applied.current = y;
      el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue, { passive: true });
    return () => {
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      cancelAnimationFrame(raf);
    };
  }, [speed, clamp, mode]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
