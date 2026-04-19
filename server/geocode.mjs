/**
 * OpenStreetMap Nominatim returns `address` with keys like road, city, postcode.
 * @see https://nominatim.org/release-docs/develop/api/Search/
 */
export function parseAddressFromNominatim(hit, fallbackPostal) {
  const a = hit.address || {};
  const num = a.house_number || "";
  const road = a.road || a.pedestrian || a.path || "";
  const streetLine = [num, road].filter(Boolean).join(" ").trim();

  const neighborhood =
    a.suburb || a.neighbourhood || a.quarter || a.city_district || "";

  const city =
    a.city || a.town || a.village || a.municipality || "";

  const state = a.state || a.region || "";
  const country = a.country || "";

  let zipCode = a.postcode || fallbackPostal || "";

  // US ZIP+4: 12345-6789 → keep first 5 digits only
  if (a.country_code === "us" && zipCode.includes("-")) {
    const parts = zipCode.split("-");
    if (parts[0].length === 5 && parts[1]?.length === 4) {
      zipCode = parts[0];
    }
  }

  // Brazilian CEP: keep 12345-678 form when present
  if (a.country_code === "br" && zipCode && !zipCode.includes("-")) {
    const d = zipCode.replace(/\D/g, "");
    if (d.length === 8) {
      zipCode = `${d.slice(0, 5)}-${d.slice(5)}`;
    }
  }

  if (!zipCode && fallbackPostal) {
    zipCode = fallbackPostal;
  }

  return {
    streetLine,
    neighborhood,
    city,
    state,
    country,
    zipCode,
  };
}

/** Normalize postal input for display and fallbacks (US 5-digit, BR CEP with hyphen). */
export function normalizePostalForLookup(postal, countryCode) {
  const cc = String(countryCode || "US").toUpperCase();
  const raw = String(postal || "").trim();
  if (cc === "BR") {
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 8) {
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    }
    return raw;
  }
  const us = raw.replace(/\D/g, "").slice(0, 9);
  if (us.length >= 5) {
    return us.slice(0, 5);
  }
  return raw;
}

/** 8-digit string for BR CEP fallbacks (digits only). */
export function brCepDigits(postal) {
  const d = String(postal || "").replace(/\D/g, "");
  return d.length === 8 ? d : "";
}
