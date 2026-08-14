// Renders a homepage teaser of the first 3 campaigns from ADVENTURES
// (see js/adventures-data.js) into #home-quests-grid. Reuses the same
// campaign-card / tone-quest-* styles as the /adventures/ page, so it
// stays visually consistent automatically and needs no separate content
// to maintain — edit adventures-data.js and this updates too.
(function () {
  const gridEl = document.getElementById("home-quests-grid");
  if (!gridEl || typeof ADVENTURES === "undefined") return;

  // Keep this in sync with the TONE_SHAPE map in js/adventures.js —
  // it's what draws the little icon badge on each card.
  const TONE_SHAPE = {
    "quest-1": "diamond",
    "quest-2": "circle",
    "quest-3": "bar",
    "quest-4": "corner",
    "quest-5": "spark",
    "quest-6": "pill",
  };

  function esc(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function parseSessionProgress(sessions) {
    const match = /(\d+)\s*of\s*(\d+)/i.exec(sessions || "");
    if (!match) return null;
    const total = Number(match[2]);
    if (!total) return null;
    return Math.max(0, Math.min(100, Math.round((Number(match[1]) / total) * 100)));
  }

  const featured = ADVENTURES.slice(0, 3);

  gridEl.innerHTML = featured
    .map((a) => {
      const shape = TONE_SHAPE[a.tone] || "circle";
      const pct = parseSessionProgress(a.sessions);
      const recruiting = a.status === "recruiting";
      const latest = a.world && a.world.length ? a.world[a.world.length - 1] : null;
      return `
      <a href="adventures/#${esc(a.slug)}" class="campaign-card tone-${a.tone}">
        <span class="campaign-card-head">
          <span class="campaign-icon" style="background-color: var(--${a.tone});">
            <span class="shape-${shape}" aria-hidden="true"></span>
          </span>
          <span class="campaign-tag" style="background-color: var(--${a.tone});">${esc(a.sessions)}</span>
        </span>
        <h2 style="color: color-mix(in oklab, var(--${a.tone}) 78%, black);">${esc(a.name)}</h2>
        <p class="campaign-card-tagline">${esc(a.tagline)}</p>
        ${a.spots ? `<span class="campaign-card-spots">${esc(a.spots)}</span>` : ""}
        ${
          latest && !recruiting
            ? `<p class="campaign-card-latest">
                <span class="latest-dot" style="background-color: var(--${a.tone});"></span>
                Latest: <strong>${esc(latest.title)}</strong>
              </p>`
            : ""
        }
        ${
          pct !== null
            ? `<span class="campaign-card-progress" role="presentation">
                <span class="campaign-card-progress-fill" style="width: ${pct}%; background-color: var(--${a.tone});"></span>
              </span>`
            : ""
        }
        <span class="campaign-card-cta">${recruiting ? "See this quest" : "Follow this quest"}</span>
      </a>`;
    })
    .join("");
})();
