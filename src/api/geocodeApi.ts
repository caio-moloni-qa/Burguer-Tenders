export type GeocodedAddress = {
  streetLine: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
};

export async function lookupAddressByPostalCode(
  postalCode: string,
  countryCode: string
): Promise<GeocodedAddress> {
  const params = new URLSearchParams({
    postalCode: postalCode.trim(),
    countryCode: countryCode.toUpperCase().slice(0, 2),
  });
  const res = await fetch(`/api/geocode?${params}`, { credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Address lookup failed");
  }
  return data.address as GeocodedAddress;
}
