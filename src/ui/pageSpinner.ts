let overlayEl: HTMLElement | null = null;

function ensureMount(): HTMLElement {
  if (overlayEl && document.body.contains(overlayEl)) {
    return overlayEl;
  }
  const el = document.createElement("div");
  el.className = "page-spinner-overlay";
  el.setAttribute("aria-live", "assertive");
  el.setAttribute("aria-label", "Loading");
  el.setAttribute("role", "status");
  el.setAttribute("data-testid", "page-spinner");
  el.innerHTML = '<div class="page-spinner__ring" aria-hidden="true"></div>';
  document.body.appendChild(el);
  overlayEl = el;
  return el;
}

export function showPageSpinner(): void {
  const el = ensureMount();
  el.style.display = "";
  el.classList.remove("page-spinner-overlay--hiding");
  el.classList.add("page-spinner-overlay--visible");
}

export function hidePageSpinner(): void {
  if (!overlayEl) {
    return;
  }
  overlayEl.classList.add("page-spinner-overlay--hiding");
  setTimeout(() => {
    if (overlayEl) {
      overlayEl.classList.remove(
        "page-spinner-overlay--visible",
        "page-spinner-overlay--hiding"
      );
      // Set display:none so Playwright's state:'hidden' can detect it correctly.
      // opacity:0 alone does not satisfy Playwright's hidden check.
      overlayEl.style.display = "none";
    }
  }, 300);
}
