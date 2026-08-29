"use client";

import { useEffect, useRef } from "react";

const ADSENSE_CLIENT = "ca-pub-6452867962392355";
const ADSENSE_SLOT = "2899407297";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, never>>;
  }
}

export function AdUnit() {
  const requested = useRef(false);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;

    try {
      if (!document.getElementById("math-adsense-script")) {
        const script = document.createElement("script");
        script.id = "math-adsense-script";
        script.async = true;
        script.crossOrigin = "anonymous";
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
        document.head.appendChild(script);
      }
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers and privacy tools may prevent AdSense from loading.
    }
  }, []);

  return (
    <aside className="ad-section" aria-label="Advertisement">
      <span className="ad-label">Advertisement</span>
      <div className="ad-frame">
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-format="autorelaxed"
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={ADSENSE_SLOT}
          data-tag-for-age-treatment="2"
        />
      </div>
    </aside>
  );
}
