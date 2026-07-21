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

  // Social icon set for the share modal fallback — see
  // guidelines/brand-social-icons.html. Generic share/copy/email/message
  // plus simplified outline platform glyphs, not official logos.
  const SHARE_ICONS = {
    copyLink: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M9 15l6-6"/><path d="M11 6l1-1a3.5 3.5 0 0 1 5 5l-1 1"/><path d="M13 18l-1 1a3.5 3.5 0 0 1-5-5l1-1"/></svg>`,
    email: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6 8.5 7 8.5-7"/></svg>`,
    message: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H8l-4 4V5Z"/></svg>`,
    facebook: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M14 21v-7h2.3l.4-3H14V9.2c0-.9.3-1.5 1.6-1.5H17V5.1C16.7 5 15.8 5 14.8 5c-2.1 0-3.6 1.3-3.6 3.7V11H9v3h2.2v7h2.8Z" fill="currentColor" stroke="none"/></svg>`,
    xTwitter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7 7l10 10M17 7 7 17" stroke-width="1.6"/></svg>`,
    whatsapp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 15.5 7 18l2.6-1.4a6 6 0 1 0-1.1-1.1Z"/><path d="M9.5 9.7c0-.4.3-.9.6-.9h.6c.2 0 .4.2.5.4l.5 1.3c.1.2 0 .5-.1.6l-.4.4c.3.7 1 1.4 1.7 1.7l.4-.4c.2-.2.4-.2.6-.1l1.3.5c.2.1.4.3.4.5v.6c0 .3-.5.6-.9.6-1.8 0-4.7-2.9-4.7-4.7Z" fill="currentColor" stroke="none"/></svg>`
  };

  function ensureShareModal() {
    let modal = document.getElementById("cdtt-share-modal");
    if (modal) return modal;
    modal = document.createElement("div");
    modal.id = "cdtt-share-modal";
    modal.className = "modal-backdrop";
    modal.innerHTML = `<div class="modal">
      <h2>Share this stop</h2>
      <p id="cdtt-share-modal-sub"></p>
      <div class="share-grid" id="cdtt-share-grid"></div>
    </div>`;
    document.body.appendChild(modal);
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("open"); });
    return modal;
  }

  function openShareModal(shareData) {
    const modal = ensureShareModal();
    const url = shareData.url || location.href;
    const text = shareData.text || shareData.title || "";
    document.getElementById("cdtt-share-modal-sub").textContent = shareData.title || "";
    const targets = [
      { label: "Copy link", icon: SHARE_ICONS.copyLink, action: async () => {
          try { await navigator.clipboard.writeText(url); showToast("Link copied to clipboard"); }
          catch (err) { showToast("Couldn't copy the link.", "error"); }
        } },
      { label: "Email", icon: SHARE_ICONS.email, href: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}` },
      { label: "Message", icon: SHARE_ICONS.message, href: `sms:?body=${encodeURIComponent(text + " " + url)}` },
      { label: "Facebook", icon: SHARE_ICONS.facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
      { label: "X", icon: SHARE_ICONS.xTwitter, href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` },
      { label: "WhatsApp", icon: SHARE_ICONS.whatsapp, href: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}` }
    ];
    const grid = document.getElementById("cdtt-share-grid");
    grid.innerHTML = targets.map((t, i) => `
      <div class="share-item">
        <button class="share-icon-btn" data-share-target="${i}" title="${t.label}">${t.icon}</button>
        <span class="share-label">${t.label}</span>
      </div>
    `).join("");
    targets.forEach((t, i) => {
      grid.querySelector(`[data-share-target="${i}"]`).addEventListener("click", () => {
        if (t.action) t.action();
        else window.open(t.href, "_blank", "noopener");
        modal.classList.remove("open");
      });
    });
    modal.classList.add("open");
  }

  // Web Share API first (native share sheet on mobile); falls back to the
  // icon-based share modal above (desktop, or if the user cancels/it's
  // unsupported) rather than silently copying to clipboard.
  async function shareOrCopy(shareData) {
    if (navigator.share) {
      try { await navigator.share(shareData); return; } catch (err) { /* user cancelled or unsupported — fall through */ }
    }
    openShareModal(shareData);
  }

  function slugify(str) {
    return String(str).toLowerCase().trim()
      .replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  global.CDTTSite = { brandLockupHTML, ICONS, showToast, shareOrCopy, openShareModal, slugify };
})(window);
