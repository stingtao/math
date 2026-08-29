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
        <span className="frontier-eyebrow">THE FRONTIER RUNS ON MATH</span>
        <h1 id="frontier-title">Build the worlds no one has reached yet.</h1>
        <p>Settle Mars. Engineer a city beneath the ocean. Decode places no one has mapped. Every mission takes only a few minutes—and every new world runs on the math you are learning.</p>
        <div className="frontier-hero-actions">
          <a className="frontier-primary" href={activeWorld.href}>Launch a 6–8 minute mission <span aria-hidden="true">→</span></a>
          <a className="frontier-secondary" href="#worlds">Explore the worlds</a>
        </div>
        <div className="frontier-promises" aria-label="Mission promises">
          <span><b>6–8 min</b> one focused mission</span>
          <span><b>Hints + retries</b> mistakes reveal clues</span>
          <span><b>Private</b> no public real identity</span>
        </div>
      </div>

      <div className="frontier-active-mission" key={activeWorld.id}>
        <div><small>{activeWorld.kicker}</small><strong>{activeWorld.worldName}</strong></div>
        <p><b>{activeWorld.missionLabel}:</b> {activeWorld.mission}</p>
        <a href={activeWorld.href}>{activeWorld.cta} <span aria-hidden="true">↗</span></a>
      </div>

      <div className="frontier-world-switcher" id="worlds" aria-label="Choose an expedition world">
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
