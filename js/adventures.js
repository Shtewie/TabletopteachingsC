// Renders the campaign switcher + panel from ADVENTURES (see adventures-data.js)
// and wires up the campaign / tab switching. No build step, no framework.

(function () {
  const TABS = ["World Log", "Characters", "Learning"];

  // Every quest tone always maps to the same icon shape, matching the
  // "What We Stand For" cards on the homepage. Edit here if you add a
  // 7th tone or want to change which shape a tone uses.
  const TONE_SHAPE = {
    "quest-1": "diamond",
    "quest-2": "circle",
    "quest-3": "bar",
    "quest-4": "corner",
    "quest-5": "spark",
    "quest-6": "pill",
  };

  // Shapes used on the section tabs — independent of campaign tone, so
  // "World Log" always uses the same mark no matter which quest is open.
  const TAB_SHAPE = {
    "World Log": "bar",
    Characters: "circle",
    Learning: "spark",
  };

  const switcherEl = document.getElementById("campaign-switcher");
  const panelEl = document.getElementById("campaign-panel");

  const joinUrl = typeof JOIN_URL === "string" ? JOIN_URL : "/#contact";

  // Links from the homepage arrive as /adventures/#lantern-marsh, so open
  // that campaign rather than always defaulting to the first one.
  const hashSlug = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  const hashMatch = ADVENTURES.some((a) => a.slug === hashSlug);

  let activeSlug = hashMatch ? hashSlug : ADVENTURES[0].slug;
  let activeTab = TABS[0];

  function esc(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function isRecruiting(adv) {
    return adv.status === "recruiting";
  }

  function shapeMark(tone, extraStyle) {
    const shape = TONE_SHAPE[tone] || "circle";
    return `<span class="shape-${shape}" aria-hidden="true" style="${extraStyle || ""}"></span>`;
  }

  // Pulls "Session 6 of 10" -> { current: 6, total: 10, pct: 60 }.
  // Falls back gracefully if a campaign's sessions text doesn't match.
  function parseSessionProgress(sessions) {
    const match = /(\d+)\s*of\s*(\d+)/i.exec(sessions || "");
    if (!match) return null;
    const current = Number(match[1]);
    const total = Number(match[2]);
    if (!total) return null;
    return { current, total, pct: Math.max(0, Math.min(100, Math.round((current / total) * 100))) };
  }

  function initials(name) {
    const words = (name || "").trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return "?";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }

  function renderSwitcher() {
    switcherEl.innerHTML = ADVENTURES.map((a) => {
      const selected = a.slug === activeSlug;
      const progress = parseSessionProgress(a.sessions);
      const latest = a.world && a.world.length ? a.world[a.world.length - 1] : null;
      const borderStyle = selected
        ? `border-color: var(--${a.tone}); box-shadow: 0 6px 0 0 var(--${a.tone});`
        : "";

      return `
        <button type="button" class="campaign-card tone-${a.tone} ${selected ? "is-active" : ""}"
          data-slug="${a.slug}" aria-pressed="${selected}" style="${borderStyle}">
          <span class="campaign-card-head">
            <span class="campaign-icon" style="background-color: var(--${a.tone});">
              ${shapeMark(a.tone)}
            </span>
            <span class="campaign-tag" style="background-color: var(--${a.tone});">${esc(a.sessions)}</span>
          </span>
          <h2 style="color: color-mix(in oklab, var(--${a.tone}) 78%, black);">${esc(a.name)}</h2>
          <p class="campaign-card-tagline">${esc(a.tagline)}</p>
          ${a.spots ? `<span class="campaign-card-spots">${esc(a.spots)}</span>` : ""}
          ${
            latest && !isRecruiting(a)
              ? `<p class="campaign-card-latest">
                  <span class="latest-dot" style="background-color: var(--${a.tone});"></span>
                  Latest: <strong>${esc(latest.title)}</strong>
                </p>`
              : ""
          }
          ${
            progress
              ? `<span class="campaign-card-progress" role="presentation">
                  <span class="campaign-card-progress-fill" style="width: ${progress.pct}%; background-color: var(--${a.tone});"></span>
                </span>`
              : ""
          }
          <span class="campaign-card-meta">${esc(a.group)}</span>
        </button>`;
    }).join("");

    switcherEl.querySelectorAll(".campaign-card").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeSlug = btn.dataset.slug;
        activeTab = TABS[0];
        renderSwitcher();
        renderPanel();
        // Move focus/scroll to the panel heading so keyboard and screen
        // reader users land on the new content, not just the button.
        const heading = panelEl.querySelector(".panel-heading h2");
        if (heading && typeof heading.scrollIntoView === "function") {
          heading.scrollIntoView({ block: "nearest" });
        }
      });
    });
  }

  function renderTabs(adv) {
    return `
      <div class="tab-list" role="tablist" aria-label="${esc(adv.name)} sections">
        ${TABS.map((t, i) => {
          const selected = t === activeTab;
          const shape = TAB_SHAPE[t] || "circle";
          const style = selected ? `background-color: var(--${adv.tone});` : "";
          const iconStyle = selected ? "" : "background-color: var(--muted-foreground); border-color: var(--muted-foreground);";
          return `
            <button type="button" id="tab-${adv.slug}-${i}" class="tab-btn ${selected ? "is-active" : ""}"
              style="${style}" data-tab="${t}" role="tab" aria-selected="${selected}" aria-controls="panel-${adv.slug}">
              <span class="tab-icon"><span class="shape-${shape}" aria-hidden="true" style="${iconStyle}"></span></span>
              ${t}
            </button>`;
        }).join("")}
      </div>`;
  }

  function renderWorldLog(adv) {
    // A campaign that hasn't started yet has no history to show — say so
    // plainly rather than rendering an empty list.
    if (!adv.world || adv.world.length === 0) {
      return `<p class="timeline-empty">This quest hasn't begun yet. Once the party sits down at session one, everything they discover gets logged here — so you can follow the story from the outside.</p>`;
    }

    const upcoming = isRecruiting(adv);
    const items = adv.world
      .map((entry, i) => {
        const latest = i === adv.world.length - 1;
        const badge = latest
          ? `<span class="timeline-latest-badge">${upcoming ? "Up next" : "Latest"}</span>`
          : "";
        return `
          <li class="${latest ? "is-latest" : ""}" style="--current-tone: var(--${adv.tone});">
            <p class="timeline-session">${esc(entry.session)}${badge}</p>
            <h3>${esc(entry.title)}</h3>
            <p>${esc(entry.body)}</p>
          </li>`;
      })
      .join("");
    return `<ol class="timeline">${items}</ol>`;
  }

  function renderCharacters(adv) {
    if (!adv.characters || adv.characters.length === 0) {
      return `<p class="characters-empty">The party for this quest is still being assembled.</p>`;
    }

    const cards = adv.characters
      .map((c) => {
        // NPCs have no player, so don't render a dangling " · " separator.
        const meta = c.player ? `${esc(c.role)} · ${esc(c.player)}` : esc(c.role);
        return `
        <article class="character-card" style="background-color: var(--${adv.tone}-soft); border-color: color-mix(in oklab, var(--${adv.tone}) 30%, white);">
          <span class="character-avatar" style="background-color: var(--${adv.tone});">${esc(initials(c.name))}</span>
          <div class="character-card-body">
            <h3>${esc(c.name)}</h3>
            <p class="character-role">${meta}</p>
            <p class="character-note">${esc(c.note)}</p>
          </div>
        </article>`;
      })
      .join("");

    const intro = isRecruiting(adv)
      ? `<p class="privacy-note" style="margin-top: 0; margin-bottom: 1.25rem;">The party hasn't formed yet — these are the faces waiting for them.</p>`
      : "";

    return `${intro}<div class="characters-grid">${cards}</div>
      <p class="privacy-note">We never publish players' real names. Characters are listed by their in-world name, and players by an anonymous label only.</p>`;
  }

  function renderLearning(adv) {
    const done = adv.objectives.filter((o) => o.done).length;
    const pct = Math.round((done / adv.objectives.length) * 100);
    const upcoming = isRecruiting(adv);

    const items = adv.objectives
      .map((o) => {
        const skillTone = SKILL_TONE[o.skill];
        return `
          <li class="objective ${o.done ? "is-done" : ""}">
            <span class="objective-check" aria-hidden="true" style="background-color: ${o.done ? `var(--${skillTone})` : "transparent"}; border-color: var(--${skillTone});">
              ${o.done ? "✓" : ""}
            </span>
            <span class="sr-only">${o.done ? "Completed:" : "Not yet completed:"}</span>
            <span class="objective-label">${esc(o.label)}</span>
            <span class="skill-tag" style="background-color: var(--${skillTone}-soft); color: color-mix(in oklab, var(--${skillTone}) 78%, black);">${esc(o.skill)}</span>
          </li>`;
      })
      .join("");

    // A campaign that hasn't started has nothing to chart yet — show the
    // goals it's built around instead of a 0% progress bar.
    const header = upcoming
      ? `<div class="progress-header"><p>The ${adv.objectives.length} goals this quest is built around</p></div>`
      : `<div class="progress-header">
          <p>${done} of ${adv.objectives.length} objectives completed</p>
          <span class="progress-pct">${pct}%</span>
        </div>
        <div class="progress-track" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(adv.name)} learning progress" style="--current-tone: var(--${adv.tone});">
          <div class="progress-fill" style="width: ${pct}%;"></div>
        </div>`;

    return `
      <div>
        ${header}
        <ul class="objectives-list" style="margin-top: 1.25rem;">${items}</ul>
        <p class="objectives-note">Every player also receives their own personalised learning record — this board is the party-wide view.</p>
      </div>`;
  }

  // The panel is a dead end without this: someone reads a campaign they
  // like and has no way to act on it.
  function renderPanelCta(adv) {
    const recruiting = isRecruiting(adv);
    const message = recruiting
      ? `<strong>${esc(adv.spots || "Spots open")}</strong> on this quest. Tell us about your young adventurer and we'll let you know if it's the right table.`
      : `This party is under way, but new quests open regularly. Ask to be told when the next one starts.`;

    return `
      <div class="panel-cta" style="border-color: color-mix(in oklab, var(--${adv.tone}) 45%, transparent);">
        <p>${message}</p>
        <a href="${joinUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-accent"
           data-track-cta="adventures-${esc(adv.slug)}">
          ${recruiting ? "Ask About a Spot" : "Join the Waitlist"}
        </a>
      </div>`;
  }

  function renderPanel() {
    const adv = ADVENTURES.find((a) => a.slug === activeSlug);
    const activeTabIndex = TABS.indexOf(activeTab);
    let body = "";
    if (activeTab === "World Log") body = renderWorldLog(adv);
    if (activeTab === "Characters") body = renderCharacters(adv);
    if (activeTab === "Learning") body = renderLearning(adv);

    panelEl.className = "campaign-panel";
    panelEl.style.borderColor = `color-mix(in oklab, var(--${adv.tone}) 35%, white)`;
    panelEl.innerHTML = `
      <div class="panel-header">
        <span class="panel-icon" style="background-color: var(--${adv.tone});">
          ${shapeMark(adv.tone)}
        </span>
        <div class="panel-heading">
          <p class="campaign-eyebrow">${esc(adv.group)}</p>
          <h2 style="color: color-mix(in oklab, var(--${adv.tone}) 78%, black);">${esc(adv.name)}</h2>
        </div>
        <span class="panel-session-tag" style="background-color: var(--${adv.tone});">${esc(adv.sessions)}</span>
      </div>
      <p class="campaign-blurb">${esc(adv.blurb)}</p>
      ${renderTabs(adv)}
      <div class="tab-panel is-active" role="tabpanel" id="panel-${adv.slug}" aria-labelledby="tab-${adv.slug}-${activeTabIndex}" tabindex="0">${body}</div>
      ${renderPanelCta(adv)}
    `;

    panelEl.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeTab = btn.dataset.tab;
        renderPanel();
      });
    });
  }

  renderSwitcher();
  renderPanel();
})();
