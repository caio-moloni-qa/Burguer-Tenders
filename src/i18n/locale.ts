/**
 * Dynamic Translation module.
 *
 * Locale is set to "en-US" by default and switched to "pt-BR" whenever a
 * successful address lookup resolves to a Brazilian store.  The active locale
 * drives both UI text (via `t()`) and currency formatting (via `formatPrice()`).
 */

import type { Product } from "../types/product";

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

const productDescriptions: Record<Locale, Record<string, string>> = {
  "en-US": {
    cheeseburguer:
      "Beef patty, melted cheese, pickles, onions, ketchup, and mustard on a toasted bun.",
    "cheeseburguer-bacon":
      "Our classic cheeseburguer with crispy bacon and creamy mayo on a toasted bun.",
    "avocado-burger":
      "Fresh avocado spread, beef patty, lettuce, tomato, and a tangy lime aioli on a brioche bun.",
    "bt-special":
      "Cheeseburguer topped with a fried egg and our signature gochujang sauce - bold heat that builds.",
    "pack-tenders":
      "Six golden chicken tenders with your choice of dipping sauce.",
    "pack-tenders-spicy":
      "Six spicy breaded chicken tenders with heat that builds, dip included.",
    "combo-tenders-cheeseburguer":
      "Four golden tenders and a classic cheeseburguer - the best of both worlds, served together.",
    "combo-bacon-fries":
      "Our crispy-bacon cheeseburguer paired with a generous serving of our golden plain fries.",
    "combo-spicy-milkshake":
      "Six fiery spicy tenders balanced with a thick, creamy chocolate milkshake. Fire meets chill.",
    "combo-tenders-drink":
      "Six golden tenders with any fountain drink of your choice. Simple, satisfying, every time.",
    "doctor-bt":
      "Our house Coke-based specialty soda with a secret twist. Refreshing, sweet, and totally addictive.",
    guarana:
      "Classic Brazilian guarana soda - lightly sweet, fruity, and perfectly fizzy. A taste of Brazil.",
    "fries-plain":
      "Crispy golden fries, lightly salted. Classic and always the right call.",
    "fries-lemon-pepper":
      "Golden fries tossed in a bright lemon-pepper seasoning. Zesty, savory, impossible to stop eating.",
    "milkshake-chocolate":
      "Thick and creamy hand-spun chocolate milkshake made with real cocoa. Served ice cold.",
    "milkshake-strawberry":
      "Hand-spun strawberry milkshake bursting with fresh berry flavor. Sweet, pink, and perfect.",
  },
  "pt-BR": {
    cheeseburguer:
      "Carne bovina, queijo derretido, picles, cebola, ketchup e mostarda no pão tostado.",
    "cheeseburguer-bacon":
      "Nosso cheeseburguer clássico com bacon crocante e maionese cremosa no pão tostado.",
    "avocado-burger":
      "Creme de avocado, carne bovina, alface, tomate e aioli de limão no pão brioche.",
    "bt-special":
      "Cheeseburguer com ovo frito e nosso molho gochujang especial - picância marcante.",
    "pack-tenders":
      "Seis tenders de frango dourados com molho de sua escolha.",
    "pack-tenders-spicy":
      "Seis tenders de frango empanados e picantes, com molho para acompanhar.",
    "combo-tenders-cheeseburguer":
      "Quatro tenders dourados e um cheeseburguer clássico - o melhor dos dois mundos.",
    "combo-bacon-fries":
      "Cheeseburguer com bacon crocante acompanhado de uma porção generosa de batatas.",
    "combo-spicy-milkshake":
      "Seis tenders picantes equilibrados com um milkshake de chocolate cremoso.",
    "combo-tenders-drink":
      "Seis tenders dourados com uma bebida de sua escolha. Simples e certeiro.",
    "doctor-bt":
      "Refrigerante especial da casa à base de cola, com um toque secreto.",
    guarana:
      "Guaraná brasileiro clássico - levemente doce, frutado e bem gaseificado.",
    "fries-plain":
      "Batatas douradas e crocantes, levemente salgadas. Clássicas e certeiras.",
    "fries-lemon-pepper":
      "Batatas douradas com tempero lemon pepper. Cítricas, salgadas e viciantes.",
    "milkshake-chocolate":
      "Milkshake de chocolate espesso e cremoso, feito com cacau de verdade.",
    "milkshake-strawberry":
      "Milkshake de morango batido na hora, doce, cremoso e cheio de sabor.",
  },
};

export function productDescription(productId: string, fallback: string): string {
  return (
    productDescriptions[activeLocale][productId] ??
    productDescriptions["en-US"][productId] ??
    fallback
  );
}

export function productName(product: Product): string {
  return (
    product.translations?.[activeLocale]?.name ??
    product.translations?.["en-US"]?.name ??
    product.name
  );
}

export function productShortName(product: Product): string {
  return (
    product.translations?.[activeLocale]?.shortName ??
    product.translations?.["en-US"]?.shortName ??
    product.shortName
  );
}

export function localizedProductDescription(product: Product): string {
  return (
    product.translations?.[activeLocale]?.description ??
    product.translations?.["en-US"]?.description ??
    productDescription(product.id, product.description)
  );
}

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
  | "caloriesLabel"
  | "caloriesValue"
  // Promo banner
  | "promoRegionLabel"
  | "promoDotLabel"
  | "promoComboEyebrow"
  | "promoComboHeadline"
  | "promoComboSubline"
  | "promoSpicyEyebrow"
  | "promoSpicyHeadline"
  | "promoSpicySubline"
  | "promoDeliveryEyebrow"
  | "promoDeliveryHeadline"
  | "promoDeliverySubline"
  // Item customizer
  | "customizerTitle"
  | "customizerClose"
  | "customizerBasePrice"
  | "customizerPatties"
  | "customizerPattySingular"
  | "customizerPattyPlural"
  | "customizerAddOns"
  | "customizerQuantity"
  | "customizerDecreaseQuantity"
  | "customizerIncreaseQuantity"
  | "customizerAddToCart"
  | "customizerExtraEverything"
  | "customizerExtraCheese"
  | "customizerExtraBacon"
  | "customizerExtraGrilledOnions"
  | "customizerExtraJalapenos"
  | "customizerExtraSauce"
  | "customizerExtraSpicyDust"
  | "customizerExtraLargePack"
  | "customizerExtraLargeDrink"
  | "customizerExtraLoadedFries"
  | "customizerExtraLargeSize"
  | "customizerExtraSeasoning"
  | "customizerExtraDippingSauce"
  | "customizerExtraNoIce"
  // Cart drawer
  | "cartTitle"
  | "cartEmpty"
  | "cartEach"
  | "cartRemove"
  | "cartDecrease"
  | "cartIncrease"
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
  | "checkoutErrorNameRequired"
  | "checkoutErrorEmailRequired"
  | "checkoutErrorEmailInvalid"
  | "checkoutErrorZipRequired"
  | "checkoutErrorCardNameRequired"
  | "checkoutErrorCardNameInvalid"
  | "checkoutErrorCardNumberRequired"
  | "checkoutErrorCardNumberInvalid"
  | "checkoutErrorExpiryRequired"
  | "checkoutErrorExpiryInvalid"
  | "checkoutErrorCvcRequired"
  | "checkoutErrorCvcInvalid"
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
  | "locationSaveError"
  | "locationLoadError"
  | "locationStoreRequired"
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
  caloriesLabel:      "Calories",
  caloriesValue:      "{calories} kcal",
  // Promo banner
  promoRegionLabel:      "Promotions",
  promoDotLabel:         "Show promotion {index} of {total}",
  promoComboEyebrow:     "Featured combo",
  promoComboHeadline:    "Protein is never enough.",
  promoComboSubline:     "Try out BeeTee's burger and tenders combo.",
  promoSpicyEyebrow:     "Heat lovers",
  promoSpicyHeadline:    "Turn up the heat.",
  promoSpicySubline:     "Our Spicy Tenders pack: bold flavor, crispy bite.",
  promoDeliveryEyebrow:  "On us",
  promoDeliveryHeadline: "Free delivery over $25.",
  promoDeliverySubline:  "Add a few favorites - we'll bring them to your door.",
  // Item customizer
  customizerTitle: "Customize {item}",
  customizerClose: "Close customizer",
  customizerBasePrice: "Base price {price}",
  customizerPatties: "Patties",
  customizerPattySingular: "patty",
  customizerPattyPlural: "patties",
  customizerAddOns: "Add-ons",
  customizerQuantity: "Quantity",
  customizerDecreaseQuantity: "Decrease quantity",
  customizerIncreaseQuantity: "Increase quantity",
  customizerAddToCart: "Add to cart",
  customizerExtraEverything: "Everything style",
  customizerExtraCheese: "Extra cheese",
  customizerExtraBacon: "Crispy bacon",
  customizerExtraGrilledOnions: "Grilled onions",
  customizerExtraJalapenos: "Jalapenos",
  customizerExtraSauce: "Extra sauce",
  customizerExtraSpicyDust: "Spicy dust",
  customizerExtraLargePack: "Make it a large pack",
  customizerExtraLargeDrink: "Large drink",
  customizerExtraLoadedFries: "Loaded fries",
  customizerExtraLargeSize: "Large size",
  customizerExtraSeasoning: "Extra seasoning",
  customizerExtraDippingSauce: "Dipping sauce",
  customizerExtraNoIce: "No ice",
  // Cart drawer
  cartTitle:         "Cart",
  cartEmpty:         "Your cart is empty.",
  cartEach:          "each",
  cartRemove:        "Remove",
  cartDecrease:      "Decrease {item}",
  cartIncrease:      "Increase {item}",
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
  checkoutErrorNameRequired:       "Name is required.",
  checkoutErrorEmailRequired:      "Email is required.",
  checkoutErrorEmailInvalid:       "Enter a valid email address.",
  checkoutErrorZipRequired:        "ZIP / postal code is required.",
  checkoutErrorCardNameRequired:   "Name on card is required.",
  checkoutErrorCardNameInvalid:    "Name on card must contain only letters and spaces.",
  checkoutErrorCardNumberRequired: "Card number is required.",
  checkoutErrorCardNumberInvalid:  "Enter a valid card number (13-19 digits).",
  checkoutErrorExpiryRequired:     "Expiry date is required.",
  checkoutErrorExpiryInvalid:      "Enter a valid expiry date (MM / YY) that hasn't passed.",
  checkoutErrorCvcRequired:        "Security code is required.",
  checkoutErrorCvcInvalid:         "Security code must be 3 or 4 digits.",
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
  locationSaveError:        "Could not save location",
  locationLoadError:        "Failed to load delivery",
  locationStoreRequired:    "We don't deliver to this address yet. Use a ZIP in an area we serve - e.g. Londrina (PR), Sao Paulo (SP), Brazil, or New York (NY), USA - then look up your address before saving.",
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
  caloriesLabel:      "Calorias",
  caloriesValue:      "{calories} kcal",
  // Promo banner
  promoRegionLabel:      "Promoções",
  promoDotLabel:         "Mostrar promoção {index} de {total}",
  promoComboEyebrow:     "Combo em destaque",
  promoComboHeadline:    "Proteína nunca é demais.",
  promoComboSubline:     "Experimente o combo de hambúrguer e tenders da BeeTee's.",
  promoSpicyEyebrow:     "Para quem ama picância",
  promoSpicyHeadline:    "Aumente a temperatura.",
  promoSpicySubline:     "Nosso pack de tenders picantes: sabor marcante e crocância.",
  promoDeliveryEyebrow:  "Por nossa conta",
  promoDeliveryHeadline: "Entrega grátis acima de R$ 50.",
  promoDeliverySubline:  "Adicione seus favoritos - nós levamos até você.",
  // Item customizer
  customizerTitle: "Personalizar {item}",
  customizerClose: "Fechar personalizacao",
  customizerBasePrice: "Preco base {price}",
  customizerPatties: "Carnes",
  customizerPattySingular: "carne",
  customizerPattyPlural: "carnes",
  customizerAddOns: "Adicionais",
  customizerQuantity: "Quantidade",
  customizerDecreaseQuantity: "Diminuir quantidade",
  customizerIncreaseQuantity: "Aumentar quantidade",
  customizerAddToCart: "Adicionar ao carrinho",
  customizerExtraEverything: "Com tudo",
  customizerExtraCheese: "Queijo extra",
  customizerExtraBacon: "Bacon crocante",
  customizerExtraGrilledOnions: "Cebola grelhada",
  customizerExtraJalapenos: "Jalapenos",
  customizerExtraSauce: "Molho extra",
  customizerExtraSpicyDust: "Tempero picante",
  customizerExtraLargePack: "Transformar em porcao grande",
  customizerExtraLargeDrink: "Bebida grande",
  customizerExtraLoadedFries: "Batata completa",
  customizerExtraLargeSize: "Tamanho grande",
  customizerExtraSeasoning: "Tempero extra",
  customizerExtraDippingSauce: "Molho para acompanhar",
  customizerExtraNoIce: "Sem gelo",
  // Cart drawer
  cartTitle:         "Carrinho",
  cartEmpty:         "Seu carrinho está vazio.",
  cartEach:          "cada",
  cartRemove:        "Remover",
  cartDecrease:      "Diminuir {item}",
  cartIncrease:      "Aumentar {item}",
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
  checkoutErrorNameRequired:       "Nome é obrigatório.",
  checkoutErrorEmailRequired:      "E-mail é obrigatório.",
  checkoutErrorEmailInvalid:       "Digite um e-mail válido.",
  checkoutErrorZipRequired:        "CEP / código postal é obrigatório.",
  checkoutErrorCardNameRequired:   "Nome no cartão é obrigatório.",
  checkoutErrorCardNameInvalid:    "Nome no cartão deve conter apenas letras e espaços.",
  checkoutErrorCardNumberRequired: "Número do cartão é obrigatório.",
  checkoutErrorCardNumberInvalid:  "Digite um número de cartão válido (13-19 dígitos).",
  checkoutErrorExpiryRequired:     "Validade é obrigatória.",
  checkoutErrorExpiryInvalid:      "Digite uma validade válida (MM / AA) que ainda não venceu.",
  checkoutErrorCvcRequired:        "Código de segurança é obrigatório.",
  checkoutErrorCvcInvalid:         "Código de segurança deve ter 3 ou 4 dígitos.",
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
  locationSaveError:        "Não foi possível salvar a localização",
  locationLoadError:        "Não foi possível carregar a entrega",
  locationStoreRequired:    "Ainda não entregamos neste endereço. Use um CEP em uma área atendida - por exemplo Londrina (PR), São Paulo (SP), Brasil, ou New York (NY), EUA - e busque o endereço antes de salvar.",
  // Header
  headerCloseLocation: "Fechar localização de entrega",
  headerOpenLocation:  "Definir localização de entrega",
  headerCloseCart:     "Fechar carrinho",
  headerOpenCart:      "Abrir carrinho",
  // Toast
  toastAddedToCart: "{item} foi adicionado ao carrinho com sucesso!",
};

let translations: Record<Locale, Dictionary> = { "en-US": en, "pt-BR": pt };

// ─── Public API ───────────────────────────────────────────────────────────────

export function setTranslationDictionaries(
  next: Partial<Record<Locale, Partial<Record<TranslationKey, string>>>>
): void {
  translations = {
    "en-US": { ...en, ...(next["en-US"] ?? {}) },
    "pt-BR": { ...pt, ...(next["pt-BR"] ?? {}) },
  };
}

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
