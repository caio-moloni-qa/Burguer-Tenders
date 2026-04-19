export type DeliveryPayload = {
  zipCode: string;
  countryCode: string;
  streetLine: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  complement: string;
  /** Fulfilling store when address matches a service area. */
  storeId: string;
};

export async function fetchDelivery(): Promise<DeliveryPayload | null> {
  const res = await fetch("/api/delivery", { credentials: "include" });
  if (!res.ok) {
    throw new Error("Failed to load delivery");
  }
  const data: { delivery: DeliveryPayload | null } = await res.json();
  return data.delivery;
}

export async function saveDelivery(body: DeliveryPayload): Promise<DeliveryPayload> {
  const res = await fetch("/api/delivery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Could not save location");
  }
  return data.delivery as DeliveryPayload;
}
