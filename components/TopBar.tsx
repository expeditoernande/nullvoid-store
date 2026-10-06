"use client";

import { useEffect, useRef, useState } from "react";
import { announcements } from "@/lib/catalog";

export function TopBar() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(46);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const group = track.firstElementChild as HTMLElement | null;
    if (!group) return;

    const measure = () => {
      // same pacing used by the reference theme: slower for wider content
      const seconds = 5 * (group.offsetWidth / 300) + 20;
      setDuration(Math.max(18, Math.round(seconds)));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(group);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="adbar" role="complementary" aria-label="Ofertas">
      <div
        ref={trackRef}
        className="marquee-track"
        style={{ animationDuration: `${duration}s` }}
      >
        {[0, 1].map((group) => (
          <div className="marquee-group" key={group} aria-hidden={group === 1}>
            {announcements.map((item) => (
              <span key={item} className="whitespace-nowrap">
                {item}
                <span className="px-[7px] text-accent/60">•</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}