(() => {
  const KEY = "__LITM_COLOR_FIX_STATUS_TAGS_ONLY__";
  if (globalThis[KEY]) return;
  globalThis[KEY] = true;
  const DASH_TIER_RX = /(?:-|–|—)\s*\d+\s*$/;
  const normalize = (s) => (s || "").replace(/\s+/g, " ").trim();
  const isTieredStatusText = (rawText, normalizedText) => {
    if (DASH_TIER_RX.test(normalizedText)) return true;
    if (/\s\d+\s*$/.test(normalizedText) && /\n/.test(rawText)) return true;
    return false;
  };
  const patchTagPill = (pill) => {
    const raw = pill.textContent || "";
    const text = normalize(raw);
    const isStatus = isTieredStatusText(raw, text);
    pill.classList.toggle("is-status", isStatus);
    pill.dataset.modType = isStatus ? "status" : "tag";
  };
  const scan = () => {
    document
      .querySelectorAll(".selected-tags-container .tag, .selected-tags .tag")
      .forEach(patchTagPill);
  };
  let scheduled = false;
  const scheduleScan = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      scan();
    });
  };
  const obs = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const n of m.addedNodes || []) {
        if (n.nodeType !== 1) continue;
        if (
          n.classList?.contains("selected-tags-container") ||
          n.classList?.contains("selected-tags") ||
          n.classList?.contains("tag") ||
          n.querySelector?.(".selected-tags-container .tag, .selected-tags .tag")
        ) {
          scheduleScan();
          return;
        }
      }
    }
  });
  Hooks.on("ready", () => {
    scan();
    obs.observe(document.body, { childList: true, subtree: true });
    setTimeout(scan, 250);
    setTimeout(scan, 1000);
  });
  Hooks.on("renderApplication", () => setTimeout(scan, 0));
  Hooks.on("renderChatMessage", () => setTimeout(scan, 0));

  // Nuovo elemento creato con + diventa status di default
  Hooks.on("preUpdateActor", (actor, changes) => {
    if (!changes.system?.floatingTagsAndStatuses) return;
    const newTags = changes.system.floatingTagsAndStatuses;
    const oldTags = actor.system.floatingTagsAndStatuses;
    if (newTags.length <= oldTags.length) return;
    newTags.forEach(tag => {
      if (!("positive" in tag)) {
        tag.isStatus = true;
      }
    });
  });

  // Mostra + invece di - per gli status positivi
  const fixPositiveStatusDisplay = () => {
    document.querySelectorAll(".fts-input-name.positive .fts-selectable").forEach(el => {
      const text = el.textContent.trim();
      const match = text.match(/^(.+?)\s*-(\d+)\s*$/);
      if (match) el.textContent = `${match[1]} +${match[2]}`;
    });
  };
  Hooks.on("renderMistEngineLegendInTheMistCharacterSheet", () => {
    requestAnimationFrame(fixPositiveStatusDisplay);
  });
  Hooks.on("renderDiceRollApp", () => {
    setTimeout(fixPositiveStatusInRollPopup, 0);
    setTimeout(fixPositiveStatusInRollPopup, 250);
  });
})();
