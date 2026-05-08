export type PromoContent = {
  id: string;
  imageSrc: string;
  imagePosition: string;
};

export let promos: readonly PromoContent[] = [];

export function setPromos(nextPromos: readonly PromoContent[]): void {
  promos = nextPromos;
}
