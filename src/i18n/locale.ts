/**
 * Dynamic Translation module.
 *
 * Locale is set to "en-US" by default and switched to "pt-BR" whenever a
 * successful address lookup resolves to a Brazilian store.  The active locale
 * drives both UI text (via `t()`) and currency formatting (via `formatPrice()`).
 */

export type Locale = "en-US" | "pt-BR";

let activeLocale: Locale = "en-US";

/** Set the active locale based on a two-letter country code. */
export function setLocale(countryCode: string): void {
  activeLocale = countryCode.toUpperCase() === "BR" ? "pt-BR" : "en-US";
}

export function getLocale(): Locale {
  return activeLocale;
}

// ─── Price formatting ─────────────────────────────────────────────────────────

const USD_TO_BRL = 5.7;

/**
 * Convert an amount expressed in the active locale's display currency back to USD.
 * Use this when the user types a value that should be interpreted as local currency.
 */
export function fromDisplayPrice(localAmount: number): number {
  return activeLocale === "pt-BR" ? localAmount / USD_TO_BRL : localAmount;
}

/**
 * Format a USD price in the active locale's currency.
 * For Brazil, applies a fixed USD→BRL conversion so the amounts feel realistic.
 */
export function formatPrice(usd: number): string {
  if (activeLocale === "pt-BR") {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(usd * USD_TO_BRL);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(usd);
}

// ─── Translation keys ─────────────────────────────────────────────────────────

export type TranslationKey =
  // Category filter
  | "categoryAll"
  | "categoryBurger"
  | "categoryTender"
  | "categoryCombo"
  | "categoryDrink"
  | "categorySide"
  // Menu page
  | "menuHeading"
  | "menuCategoryLabel"
  | "menuSearchLabel"
  | "menuSearchPlaceholder"
  | "menuOrderingFrom"
  | "menuAddToCart"
  | "menuAddToCartHint"
  | "menuNoItems"
  | "spicyBadge"
  // Cart drawer
  | "cartTitle"
  | "cartEmpty"
  | "cartEach"
  | "cartRemove"
  | "cartSubtotal"
  | "cartGoToCheckout"
  // Checkout page
  | "checkoutBackToMenu"
  | "checkoutTitle"
  | "checkoutSectionDetails"
  | "checkoutName"
  | "checkoutEmail"
  | "checkoutSectionDelivery"
  | "checkoutZip"
  | "checkoutStreet"
  | "checkoutNeighborhood"
  | "checkoutCityState"
  | "checkoutCountry"
  | "checkoutComplement"
  | "checkoutSectionPayment"
  | "checkoutPayCard"
  | "checkoutPayRestaurant"
  | "checkoutCardDetails"
  | "checkoutCardName"
  | "checkoutCardNumber"
  | "checkoutExpiry"
  | "checkoutSecurityCode"
  | "checkoutOrderSummary"
  | "checkoutNoItems"
  | "checkoutSubtotal"
  | "checkoutTip"
  | "checkoutTipNone"
  | "checkoutTotal"
  | "checkoutDonation"
  | "checkoutDonationNone"
  | "checkoutDonationFixed"
  | "checkoutDonationPercent"
  | "checkoutDonationCustom"
  | "checkoutPlaceOrder"
  // Confirmation page
  | "confirmTitle"
  | "confirmSubtitle"
  | "confirmEta"
  | "confirmDeliveryAddress"
  | "confirmBackToMenu"
  // Location panel
  | "locationPanelTitle"
  | "locationIntro"
  | "locationStoresTitleBR"
  | "locationStoresTitleUS"
  | "locationStoreAvailable"
  | "locationStoreUnavailable"
  | "locationStoreHint"
  | "locationCountryLabel"
  | "locationCountryUS"
  | "locationCountryBR"
  | "locationZip"
  | "locationLookupBtn"
  | "locationLookingUp"
  | "locationStreet"
  | "locationStreetPlaceholder"
  | "locationNeighborhood"
  | "locationCity"
  | "locationStateProv"
  | "locationCountryFromLookup"
  | "locationComplement"
  | "locationComplementPlaceholder"
  | "locationSaveBtn"
  | "locationSaving"
  // Header
  | "headerCloseLocation"
  | "headerOpenLocation"
  | "headerCloseCart"
  | "headerOpenCart"
  // Toast
  | "toastAddedToCart";

// ─── Dictionaries ─────────────────────────────────────────────────────────────

type Dictionary = Record<TranslationKey, string>;

const en: Dictionary = {
  // Category filter
  categoryAll:     "All",
  categoryBurger:  "Burgers",
  categoryTender:  "Tenders",
  categoryCombo:   "Combos",
  categoryDrink:   "Drinks",
  categorySide:    "Sides",
  // Menu page
  menuHeading:           "Available to buy",
  menuCategoryLabel:     "Category",
  menuSearchLabel:       "Search",
  menuSearchPlaceholder: "Search items\u2026",
  menuOrderingFrom:      "Ordering from",
  menuAddToCart:      "Add to cart",
  menuAddToCartHint:  "Set your delivery location first",
  menuNoItems:        "No items in this category yet.",
  spicyBadge:         "Spicy",
  // Cart drawer
  cartTitle:         "Cart",
  cartEmpty:         "Your cart is empty.",
  cartEach:          "each",
  cartRemove:        "Remove",
  cartSubtotal:      "Subtotal",
  cartGoToCheckout:  "Go to checkout",
  // Checkout page
  checkoutBackToMenu:      "← Back to menu",
  checkoutTitle:           "Checkout",
  checkoutSectionDetails:  "Your details",
  checkoutName:            "Name",
  checkoutEmail:           "Email",
  checkoutSectionDelivery: "Delivery address",
  checkoutZip:             "ZIP / Postal code",
  checkoutStreet:          "Street address",
  checkoutNeighborhood:    "Neighborhood",
  checkoutCityState:       "City / State",
  checkoutCountry:         "Country",
  checkoutComplement:      "Complement",
  checkoutSectionPayment:  "Payment",
  checkoutPayCard:         "Credit/debit card",
  checkoutPayRestaurant:   "Pay in restaurant",
  checkoutCardDetails:     "Card details",
  checkoutCardName:        "Name on card",
  checkoutCardNumber:      "Card number",
  checkoutExpiry:          "Expiry",
  checkoutSecurityCode:    "Security code",
  checkoutOrderSummary:    "Order summary",
  checkoutNoItems:         "No items in cart.",
  checkoutSubtotal:        "Subtotal",
  checkoutTip:             "Tip",
  checkoutTipNone:         "No tip",
  checkoutTotal:           "Total",
  checkoutDonation:        "Donation to",
  checkoutDonationNone:    "No donation",
  checkoutDonationFixed:   "Fixed amount",
  checkoutDonationPercent: "% of order",
  checkoutDonationCustom:  "Custom",
  checkoutPlaceOrder:      "Place order",
  // Confirmation page
  confirmTitle:           "Thank you, {name}!",
  confirmSubtitle:        "Your order is placed!",
  confirmEta:             "Estimated delivery: {time}",
  confirmDeliveryAddress: "Delivery address",
  confirmBackToMenu:      "Back to menu",
  // Location panel
  locationPanelTitle:       "Your location",
  locationIntro:            "Choose country and postal code, then look up your address (Brazil: ViaCEP; US & others: OpenStreetMap — no API key). You can edit every field before saving. We only deliver where a store serves your city.",
  locationStoresTitleBR:    "Stores (Brazil)",
  locationStoresTitleUS:    "Stores (United States)",
  locationStoreAvailable:   "Delivery available from {store}",
  locationStoreUnavailable: "We don't deliver to this city yet. Try another ZIP in the areas listed below.",
  locationStoreHint:        "Enter your ZIP and use Look up address to see if we deliver to you.",
  locationCountryLabel:     "Country",
  locationCountryUS:        "United States",
  locationCountryBR:        "Brazil",
  locationZip:              "ZIP / Postal code",
  locationLookupBtn:        "Look up address",
  locationLookingUp:        "Looking up\u2026",
  locationStreet:           "Street address",
  locationStreetPlaceholder:"Street number and name",
  locationNeighborhood:     "Neighborhood",
  locationCity:             "City",
  locationStateProv:        "State / Province",
  locationCountryFromLookup:"Country (from lookup)",
  locationComplement:       "Complement",
  locationComplementPlaceholder: "Apt, floor, reference\u2026",
  locationSaveBtn:          "Save location",
  locationSaving:           "Saving\u2026",
  // Header
  headerCloseLocation: "Close delivery location",
  headerOpenLocation:  "Set delivery location",
  headerCloseCart:     "Close shopping cart",
  headerOpenCart:      "Open shopping cart",
  // Toast
  toastAddedToCart: "{item} was successfully added to cart!",
};

const pt: Dictionary = {
  // Category filter
  categoryAll:     "Tudo",
  categoryBurger:  "Hambúrgueres",
  categoryTender:  "Tenders",
  categoryCombo:   "Combos",
  categoryDrink:   "Bebidas",
  categorySide:    "Acompanhamentos",
  // Menu page
  menuHeading:           "Disponível para compra",
  menuCategoryLabel:     "Categoria",
  menuSearchLabel:       "Buscar",
  menuSearchPlaceholder: "Buscar itens\u2026",
  menuOrderingFrom:      "Pedindo de",
  menuAddToCart:      "Adicionar ao carrinho",
  menuAddToCartHint:  "Defina seu endereço de entrega primeiro",
  menuNoItems:        "Nenhum item nesta categoria ainda.",
  spicyBadge:         "Picante",
  // Cart drawer
  cartTitle:         "Carrinho",
  cartEmpty:         "Seu carrinho está vazio.",
  cartEach:          "cada",
  cartRemove:        "Remover",
  cartSubtotal:      "Subtotal",
  cartGoToCheckout:  "Ir para o pagamento",
  // Checkout page
  checkoutBackToMenu:      "← Voltar ao menu",
  checkoutTitle:           "Finalizar pedido",
  checkoutSectionDetails:  "Seus dados",
  checkoutName:            "Nome",
  checkoutEmail:           "E-mail",
  checkoutSectionDelivery: "Endereço de entrega",
  checkoutZip:             "CEP / Código postal",
  checkoutStreet:          "Endereço",
  checkoutNeighborhood:    "Bairro",
  checkoutCityState:       "Cidade / Estado",
  checkoutCountry:         "País",
  checkoutComplement:      "Complemento",
  checkoutSectionPayment:  "Pagamento",
  checkoutPayCard:         "Cartão de crédito/débito",
  checkoutPayRestaurant:   "Pagar no restaurante",
  checkoutCardDetails:     "Dados do cartão",
  checkoutCardName:        "Nome no cartão",
  checkoutCardNumber:      "Número do cartão",
  checkoutExpiry:          "Validade",
  checkoutSecurityCode:    "Código de segurança",
  checkoutOrderSummary:    "Resumo do pedido",
  checkoutNoItems:         "Nenhum item no carrinho.",
  checkoutSubtotal:        "Subtotal",
  checkoutTip:             "Gorjeta",
  checkoutTipNone:         "Sem gorjeta",
  checkoutTotal:           "Total",
  checkoutDonation:        "Doação para",
  checkoutDonationNone:    "Sem doação",
  checkoutDonationFixed:   "Valor fixo",
  checkoutDonationPercent: "% do pedido",
  checkoutDonationCustom:  "Personalizado",
  checkoutPlaceOrder:      "Fazer pedido",
  // Confirmation page
  confirmTitle:           "Obrigado(a), {name}!",
  confirmSubtitle:        "Seu pedido foi realizado!",
  confirmEta:             "Entrega estimada: {time}",
  confirmDeliveryAddress: "Endereço de entrega",
  confirmBackToMenu:      "Voltar ao menu",
  // Location panel
  locationPanelTitle:       "Sua localização",
  locationIntro:            "Escolha o país e o código postal, depois busque seu endereço (Brasil: ViaCEP; outros: OpenStreetMap — sem chave de API). Você pode editar todos os campos antes de salvar. Entregamos apenas nas cidades atendidas por nossas lojas.",
  locationStoresTitleBR:    "Lojas (Brasil)",
  locationStoresTitleUS:    "Lojas (Estados Unidos)",
  locationStoreAvailable:   "Entrega disponível por {store}",
  locationStoreUnavailable: "Ainda não entregamos nesta cidade. Tente outro CEP nas áreas listadas abaixo.",
  locationStoreHint:        "Digite seu CEP e use Buscar endereço para ver se entregamos para você.",
  locationCountryLabel:     "País",
  locationCountryUS:        "Estados Unidos",
  locationCountryBR:        "Brasil",
  locationZip:              "CEP / Código postal",
  locationLookupBtn:        "Buscar endereço",
  locationLookingUp:        "Buscando\u2026",
  locationStreet:           "Endereço",
  locationStreetPlaceholder:"Número e nome da rua",
  locationNeighborhood:     "Bairro",
  locationCity:             "Cidade",
  locationStateProv:        "Estado / Província",
  locationCountryFromLookup:"País (da busca)",
  locationComplement:       "Complemento",
  locationComplementPlaceholder: "Apto, andar, referência\u2026",
  locationSaveBtn:          "Salvar localização",
  locationSaving:           "Salvando\u2026",
  // Header
  headerCloseLocation: "Fechar localização de entrega",
  headerOpenLocation:  "Definir localização de entrega",
  headerCloseCart:     "Fechar carrinho",
  headerOpenCart:      "Abrir carrinho",
  // Toast
  toastAddedToCart: "{item} foi adicionado ao carrinho com sucesso!",
};

const translations: Record<Locale, Dictionary> = { "en-US": en, "pt-BR": pt };

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Translate a key in the active locale.
 * Optional `vars` map replaces `{placeholder}` tokens in the string.
 */
export function t(key: TranslationKey, vars?: Record<string, string>): string {
  const dict = translations[activeLocale];
  let str = dict[key] ?? translations["en-US"][key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), v);
    }
  }
  return str;
}
