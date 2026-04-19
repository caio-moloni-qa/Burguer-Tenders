/** Logo + title block — navigates to the shop (home) menu. */
export function renderHeaderBrand(): string {
  return `
        <button
          type="button"
          class="site-brand site-brand--home"
          data-action="go-home"
          data-testid="header-home"
          aria-label="Burguer-Tenders — go to menu"
        >
          <img
            class="site-logo"
            src="/images/logo.png"
            alt=""
            width="72"
            height="72"
            decoding="async"
            data-testid="site-logo"
          />
          <span class="site-brand__text">
            <span class="site-title">Burguer-Tenders</span>
            <span class="site-tagline">the best of both worlds</span>
          </span>
        </button>`;
}
