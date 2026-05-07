import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { lookupAddressByPostalCode } from "../../api/geocodeApi";
import { saveDelivery } from "../../api/deliveryApi";
import { getProductById } from "../../data/products";
import { useCartStore } from "../../stores/cartStore";
import {
  type LocationDelivery,
  useLocationStore,
} from "../../stores/locationStore";
import { useUiStore } from "../../stores/uiStore";
import { setLocale, t } from "../../i18n/locale";
import { shouldAutoLookupPostal } from "../../location/postalCode";
import { StoreList } from "./StoreList";
import { StoreStatus } from "./StoreStatus";

/** Delay between the lookup spinner disappearing and the Save button re-enabling. */
const SAVE_RELEASE_DELAY_MS = 500;

export function LocationDrawer() {
  const open = useLocationStore((s) => s.panelOpen);
  const closePanel = useLocationStore((s) => s.closePanel);
  const delivery = useLocationStore((s) => s.delivery);
  const setField = useLocationStore((s) => s.setField);
  const applyGeocoded = useLocationStore((s) => s.applyGeocoded);
  const setDeliveryFromServer = useLocationStore((s) => s.setDeliveryFromServer);
  const lookupLoading = useLocationStore((s) => s.lookupLoading);
  const setLookupLoading = useLocationStore((s) => s.setLookupLoading);
  const lookupError = useLocationStore((s) => s.lookupError);
  const setLookupError = useLocationStore((s) => s.setLookupError);

  const addProduct = useCartStore((s) => s.addProduct);
  const pendingAddProductId = useUiStore((s) => s.pendingAddProductId);
  const setPendingAddProductId = useUiStore((s) => s.setPendingAddProductId);
  const showToast = useUiStore((s) => s.showToast);

  const [saveReleased, setSaveReleased] = useState(true);

  useEffect(() => {
    if (lookupLoading) {
      setSaveReleased(false);
      return;
    }
    const id = window.setTimeout(() => setSaveReleased(true), SAVE_RELEASE_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [lookupLoading]);

  const runPostalLookup = async () => {
    const zip = delivery.zipCode.trim();
    if (!zip) {
      setLookupError("Enter a postal code first.");
      return;
    }
    if (lookupLoading) {
      return;
    }
    setLookupLoading(true);
    setLookupError("");
    try {
      const addr = await lookupAddressByPostalCode(zip, delivery.countryCode);
      applyGeocoded(addr);
      const nextStoreId = useLocationStore.getState().delivery.storeId;
      if (nextStoreId) {
        setLocale(delivery.countryCode);
      }
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : "Address lookup failed");
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSave = async () => {
    if (!delivery.storeId.trim()) {
      window.alert(
        "We don't deliver to this address yet. Use a ZIP in an area we serve — e.g. Londrina (PR), São Paulo (SP), Brazil, or New York (NY), USA — then look up your address before saving."
      );
      return;
    }
    try {
      const saved = await saveDelivery(delivery);
      setDeliveryFromServer(saved);
      closePanel();
      if (pendingAddProductId) {
        addProduct(pendingAddProductId, 1);
        const productName =
          getProductById(pendingAddProductId)?.name ?? "Item";
        showToast(productName);
        setPendingAddProductId(null);
      }
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Could not save location");
    }
  };

  const handleClose = () => {
    setPendingAddProductId(null);
    closePanel();
  };

  const handleZipBlur = () => {
    if (shouldAutoLookupPostal(delivery.zipCode, delivery.countryCode)) {
      void runPostalLookup();
    }
  };

  const saveDisabled = lookupLoading || !saveReleased;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          "data-testid": "location-panel",
          sx: {
            width: { xs: "100vw", sm: 460 },
            display: "flex",
            flexDirection: "column",
          },
        },
        backdrop: { "data-action": "close-location" },
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          id="location-drawer-title"
          variant="h6"
          sx={{ fontWeight: 700 }}
        >
          {t("locationPanelTitle")}
        </Typography>
        <IconButton
          onClick={handleClose}
          aria-label="Close location"
          data-action="close-location"
        >
          <CloseRoundedIcon />
        </IconButton>
      </Stack>

      <Box sx={{ flexGrow: 1, overflowY: "auto", px: 2, py: 2 }}>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {t("locationIntro")}
          </Typography>

          <Box data-testid="location-stores-list">
            <StoreList countryCode={delivery.countryCode} />
          </Box>

          <StoreStatus
            countryCode={delivery.countryCode}
            city={delivery.city}
            state={delivery.state}
          />

          <TextField
            select
            id="location-country"
            name="countryCode"
            value={delivery.countryCode}
            onChange={(e) =>
              setField(
                "countryCode",
                e.target.value.toUpperCase().slice(0, 2)
              )
            }
            slotProps={{
              select: {
                inputProps: {
                  "data-location-field": "countryCode",
                  "data-testid": "location-country",
                  "aria-label": t("locationCountryLabel"),
                  autoComplete: "country",
                },
              },
            }}
          >
            <MenuItem value="US">{t("locationCountryUS")}</MenuItem>
            <MenuItem value="BR">{t("locationCountryBR")}</MenuItem>
          </TextField>

          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "flex-start" }}
          >
            <TextField
              id="location-zip"
              name="locationZip"
              placeholder={t("locationZip")}
              value={delivery.zipCode}
              onChange={(e) => setField("zipCode", e.target.value)}
              onBlur={handleZipBlur}
              slotProps={{
                htmlInput: {
                  "data-location-field": "zipCode",
                  "data-testid": "location-zip",
                  "aria-label": t("locationZip"),
                  inputMode: "numeric",
                  autoComplete: "postal-code",
                },
              }}
            />
            <Button
              variant="contained"
              color="primary"
              disabled={lookupLoading}
              onClick={() => void runPostalLookup()}
              startIcon={
                lookupLoading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <SearchRoundedIcon />
                )
              }
              data-action="lookup-address"
              data-testid="location-lookup"
              sx={{ whiteSpace: "nowrap", flexShrink: 0, mt: 0.25 }}
            >
              {lookupLoading ? t("locationLookingUp") : t("locationLookupBtn")}
            </Button>
          </Stack>

          {lookupError && (
            <Typography
              variant="body2"
              color="error"
              role="alert"
              data-testid="location-lookup-error"
            >
              {lookupError}
            </Typography>
          )}

          <LocationField
            id="location-street"
            field="streetLine"
            testId="location-street"
            placeholder={t("locationStreetPlaceholder")}
            ariaLabel={t("locationStreet")}
            autoComplete="street-address"
            value={delivery.streetLine}
            onChange={(v) => setField("streetLine", v)}
          />
          <LocationField
            id="location-neighborhood"
            field="neighborhood"
            testId="location-neighborhood"
            placeholder={t("locationNeighborhood")}
            ariaLabel={t("locationNeighborhood")}
            value={delivery.neighborhood}
            onChange={(v) => setField("neighborhood", v)}
          />
          <Stack direction="row" spacing={1}>
            <LocationField
              id="location-city"
              field="city"
              testId="location-city"
              placeholder={t("locationCity")}
              ariaLabel={t("locationCity")}
              autoComplete="address-level2"
              value={delivery.city}
              onChange={(v) => setField("city", v)}
            />
            <LocationField
              id="location-state"
              field="state"
              testId="location-state"
              placeholder={t("locationStateProv")}
              ariaLabel={t("locationStateProv")}
              autoComplete="address-level1"
              value={delivery.state}
              onChange={(v) => setField("state", v)}
            />
          </Stack>
          <LocationField
            id="location-country-name"
            field="country"
            testId="location-country-name"
            placeholder={t("locationCountryFromLookup")}
            ariaLabel={t("locationCountryFromLookup")}
            autoComplete="country-name"
            value={delivery.country}
            onChange={(v) => setField("country", v)}
          />
          <LocationField
            id="location-complement"
            field="complement"
            testId="location-complement"
            placeholder={t("locationComplementPlaceholder")}
            ariaLabel={t("locationComplement")}
            autoComplete="address-line2"
            value={delivery.complement}
            onChange={(v) => setField("complement", v)}
          />
        </Stack>
      </Box>

      <Divider />
      <Box sx={{ px: 2, py: 2 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          startIcon={
            lookupLoading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <SaveRoundedIcon />
            )
          }
          disabled={saveDisabled}
          onClick={() => void handleSave()}
          data-action="save-location"
          data-testid="location-save"
        >
          {lookupLoading ? t("locationSaving") : t("locationSaveBtn")}
        </Button>
      </Box>
    </Drawer>
  );
}

type LocationFieldProps = {
  id: string;
  field: keyof LocationDelivery;
  testId: string;
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
};

function LocationField({
  id,
  field,
  testId,
  ariaLabel,
  value,
  onChange,
  placeholder,
  autoComplete,
}: LocationFieldProps) {
  return (
    <TextField
      id={id}
      name={field}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      slotProps={{
        htmlInput: {
          "data-location-field": field,
          "data-testid": testId,
          "aria-label": ariaLabel,
          autoComplete,
        },
      }}
    />
  );
}
