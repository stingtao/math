"use client";

import Image from "next/image";
import { useState } from "react";
import { frontierWorlds } from "@/lib/frontier-worlds";
import type { ThemeId } from "@/lib/themes";

export function FrontierWorldExplorer() {
  const [activeId, setActiveId] = useState<ThemeId>("space");
  const activeWorld = frontierWorlds.find((world) => world.id === activeId) ?? frontierWorlds[1];

  return (
    <section className={`frontier-hero frontier-${activeWorld.id}`} id="top" data-frontier-world={activeWorld.id} aria-labelledby="frontier-title">
      <div className="frontier-hero-media" aria-hidden="true">
        <Image
          key={activeWorld.id}
          src={activeWorld.image}
          alt=""
          fill
          priority={activeWorld.id === "space"}
          sizes="100vw"
        />
      </div>
      <div className="frontier-hero-shade" aria-hidden="true" />
      <div className="frontier-hero-content">
        <span className="frontier-eyebrow">PARENT + CHILD · SIDE BY SIDE</span>
        <h1 id="frontier-title">Learn math together.</h1>
        <p>You stay beside your child. Math brings the example, the practice, and a useful prompt for the next conversation.</p>
        <div className="frontier-hero-actions">
          <a className="frontier-primary" href={activeWorld.href}>Start a family session <span aria-hidden="true">→</span></a>
          <a className="frontier-secondary" href="#story">See how co-learning works</a>
        </div>
        <div className="frontier-promises" aria-label="Family learning promises">
          <span><b>8–12 min</b> together</span>
          <span><b>Parent prompts</b> included</span>
        </div>
      </div>

      <div className="frontier-active-mission" key={activeWorld.id}>
        <small>{activeWorld.worldName}</small>
        <strong>{activeWorld.mission}</strong>
      </div>

      <div className="frontier-world-switcher" id="worlds" aria-label="Choose a family learning world">
        {frontierWorlds.map((world) => (
          <button
            className={world.id === activeWorld.id ? "active" : ""}
            type="button"
            aria-pressed={world.id === activeWorld.id}
            onClick={() => setActiveId(world.id)}
            key={world.id}
          >
            <small>{world.index}</small>
            <span>{world.navLabel}</span>
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">{activeWorld.worldName} selected. {activeWorld.mission}</p>
    </section>
  );
}
