export type AppView = "shop" | "checkout" | "confirmation";

let view: AppView = "shop";
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((fn) => fn());
}

export function getView(): AppView {
  return view;
}

export function setView(next: AppView): void {
  view = next;
  emit();
}

export function subscribeView(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
