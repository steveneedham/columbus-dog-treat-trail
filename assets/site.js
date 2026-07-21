/*
  Columbus Dog Treat Trail — shared UI helpers for the secondary pages.
  Load after assets/stops-client.js (CDTT.escapeHtml is reused here).
*/
(function (global) {
  const LOCKUP_MARK = `<svg class="lockup" viewBox="0 0 340 76" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0,0) scale(0.34)">
      <circle cx="110" cy="110" r="104" fill="#EDE6D6" stroke="#2B2A26" stroke-width="6"/>
      <path d="M 30 150 C 70 175, 110 175, 130 140 S 190 90, 185 65" fill="none" stroke="#4C6B4F" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 14"/>
      <g transform="translate(178,50)">
        <line x1="0" y1="0" x2="0" y2="22" stroke="#2B2A26" stroke-width="3" stroke-linecap="round"/>
        <path d="M 0 0 L 16 5 L 0 11 Z" fill="#C68A2E"/>
      </g>
      <g transform="translate(88,92) rotate(-6)">
        <ellipse cx="0" cy="30" rx="27" ry="21" fill="#B5502C" stroke="#2B2A26" stroke-width="2"/>
        <ellipse cx="-27" cy="-2" rx="12" ry="15.5" fill="#B5502C" stroke="#2B2A26" stroke-width="2" transform="rotate(-22 -27 -2)"/>
        <ellipse cx="-9" cy="-19" rx="12" ry="16" fill="#B5502C" stroke="#2B2A26" stroke-width="2" transform="rotate(-8 -9 -19)"/>
        <ellipse cx="12" cy="-19" rx="12" ry="16" fill="#B5502C" stroke="#2B2A26" stroke-width="2" transform="rotate(8 12 -19)"/>
        <ellipse cx="30" cy="-2" rx="12" ry="15.5" fill="#B5502C" stroke="#2B2A26" stroke-width="2" transform="rotate(22 30 -2)"/>
      </g>
    </g>
    <text x="86" y="34" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" letter-spacing="1.6" fill="#5B5648">COLUMBUS</text>
    <text x="86" y="60" font-family="'Fraunces', serif" font-size="26" font-weight="700" fill="#2B2A26">DOG TREAT TRAIL</text>
  </svg>`;

  function brandLockupHTML(subtitle) {
    return `<div class="brand-lockup">${LOCKUP_MARK}<div><div class="subtitle">${CDTT.escapeHtml(subtitle || "")}</div></div></div>`;
  }

  const ICONS = {
    directions: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h4v4"/><path d="M18 4 9 13"/><path d="M12 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>`,
    share: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M9 15l6-6"/><path d="M11 6l1-1a3.5 3.5 0 0 1 5 5l-1 1"/><path d="M13 18l-1 1a3.5 3.5 0 0 1-5-5l1-1"/></svg>`,
    nearMe: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 12 2a7 7 0 0 1 7 7.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5" fill="currentColor" stroke="none"/></svg>`,
    stop: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 21V4"/><path d="M6 5 18 8l-12 3"/></svg>`,
    mapPin: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 12 2a7 7 0 0 1 7 7.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>`,
    reportProblem: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4"/><circle cx="12" cy="16.6" r="0.9" fill="currentColor" stroke="none"/></svg>`,
    verified: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.5 2.5L16 9.5"/></svg>`,
    toy: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 9c-1.4 0-2.5-1.1-2.5-2.5S5.1 4 6.5 4c1 0 1.8.6 2.2 1.4.8-.3 1.6-.4 3.3-.4s2.5.1 3.3.4C15.7 4.6 16.5 4 17.5 4 18.9 4 20 5.1 20 6.5S18.9 9 17.5 9c-.5 0-.9-.1-1.3-.4.4.9.6 1.9.6 3.4s-.2 2.5-.6 3.4c.4-.2.8-.4 1.3-.4 1.4 0 2.5 1.1 2.5 2.5S18.9 20 17.5 20c-1 0-1.8-.6-2.2-1.4-.8.3-1.6.4-3.3.4s-2.5-.1-3.3-.4C8.3 19.4 7.5 20 6.5 20 5.1 20 4 18.9 4 17.5S5.1 15 6.5 15c.5 0 .9.1 1.3.4-.4-.9-.6-1.9-.6-3.4s.2-2.5.6-3.4C7.4 8.9 7 9 6.5 9Z"/></svg>`
  };

  function showToast(message, kind) {
    let el = document.getElementById("cdtt-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "cdtt-toast";
      el.className = "toast";
      el.innerHTML = `<span class="dot"></span><span class="toast-msg"></span>`;
      document.body.appendChild(el);
    }
    el.classList.toggle("error", kind === "error");
    el.querySelector(".toast-msg").textContent = message;
    el.classList.add("open");
    clearTimeout(el._hideTimer);
    el._hideTimer = setTimeout(() => el.classList.remove("open"), 2600);
  }

  // Web Share API with a copy-to-clipboard fallback, used by every
  // "Share this stop" action across the site.
  async function shareOrCopy(shareData) {
    if (navigator.share) {
      try { await navigator.share(shareData); return; } catch (err) { /* user cancelled or unsupported — fall through */ }
    }
    try {
      await navigator.clipboard.writeText(shareData.url || shareData.text || "");
      showToast("Link copied to clipboard");
    } catch (err) {
      showToast("Couldn't copy the link — copy it from the address bar.", "error");
    }
  }

  function slugify(str) {
    return String(str).toLowerCase().trim()
      .replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  global.CDTTSite = { brandLockupHTML, ICONS, showToast, shareOrCopy, slugify };
})(window);
