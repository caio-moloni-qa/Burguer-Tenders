import { t } from "../i18n/locale";

const HIDE_AFTER_MS = 2500;
const FADE_OUT_MS = 350;

let toastEl: HTMLElement | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;

function ensureMount(): HTMLElement {
  if (toastEl && document.body.contains(toastEl)) {
    return toastEl;
  }
  const el = document.createElement("div");
  el.className = "toast";
  el.setAttribute("role", "status");
  el.setAttribute("aria-live", "polite");
  el.setAttribute("data-testid", "cart-toast");
  document.body.appendChild(el);
  toastEl = el;
  return el;
}

export function showCartToast(itemName: string): void {
  const el = ensureMount();

  if (hideTimer !== null) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }

  el.textContent = t("toastAddedToCart", { item: itemName });
  el.classList.remove("toast--hiding");
  el.classList.add("toast--visible");

  hideTimer = setTimeout(() => {
    el.classList.add("toast--hiding");
    hideTimer = setTimeout(() => {
      el.classList.remove("toast--visible", "toast--hiding");
      hideTimer = null;
    }, FADE_OUT_MS);
  }, HIDE_AFTER_MS);
}
