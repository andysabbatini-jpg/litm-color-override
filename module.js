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

  // FIX: nuovo tag floating creato come positivo di default
  Hooks.on("preCreateActor", () => {});
  
  const fixNewFloatingTag = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const n of m.addedNodes || []) {
        if (n.nodeType !== 1) continue;
        // Cerca nuovi tag negativi appena aggiunti
        const newNegative = n.classList?.contains("fts-input-name") 
          ? (n.classList.contains("negative") ? n : null)
          : n.querySelector?.(".fts-input-name.negative");
        if (!newNegative) continue;
        // Simula click sul toggle per renderlo positivo
        const toggle = newNegative.querySelector(".fts-tag-modifier-toggle");
        if (toggle) toggle.click();
      }
    }
  });

  Hooks.on("ready", () => {
    fixNewFloatingTag.observe(document.body, { childList: true, subtree: true });
  });

})();
