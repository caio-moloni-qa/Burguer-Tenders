/** Physical store that can fulfill delivery for a service area. */
export type StoreDefinition = {
  id: string;
  displayName: string;
  countryCode: "BR" | "US";
  /** City + state must match after normalization (ViaCEP / geocoder output). */
  serviceAreas: readonly { city: string; state: string }[];
};
