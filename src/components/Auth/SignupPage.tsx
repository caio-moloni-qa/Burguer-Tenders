import type { FormEvent } from "react";
import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import PersonOffRoundedIcon from "@mui/icons-material/PersonOffRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { lookupAddressByPostalCode } from "../../api/geocodeApi";
import { signupUser } from "../../api/authApi";
import { resolveStoreForDelivery } from "../../data/stores";
import { setLocale, t } from "../../i18n/locale";
import type { LocationDelivery } from "../../stores/locationStore";
import { useLocationStore } from "../../stores/locationStore";
import { useAuthStore } from "../../stores/authStore";
import { useUiStore } from "../../stores/uiStore";
import { shouldAutoLookupPostal } from "../../location/postalCode";
import { AuthSuccessOverlay } from "./AuthSuccessOverlay";
import { Header } from "../Header/Header";
import { StoreStatus } from "../Location/StoreStatus";

const emptyLocation: LocationDelivery = {
  zipCode: "",
  countryCode: "US",
  streetLine: "",
  neighborhood: "",
  city: "",
  state: "",
  country: "",
  complement: "",
  storeId: "",
};

export function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [location, setLocation] = useState<LocationDelivery>(emptyLocation);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const setOrders = useAuthStore((s) => s.setOrders);
  const setDeliveryFromServer = useLocationStore((s) => s.setDeliveryFromServer);
  const setView = useUiStore((s) => s.setView);
  const bumpLocaleVersion = useUiStore((s) => s.bumpLocaleVersion);

  const setLocationField = <K extends keyof LocationDelivery>(
    field: K,
    value: LocationDelivery[K]
  ) => {
    setLocation((current) => {
      const next = { ...current, [field]: value };
      const store = resolveStoreForDelivery(next);
      return { ...next, storeId: store?.id ?? "" };
    });
  };

  const handleCountryChange = (countryCode: string) => {
    const nextCountryCode = countryCode.toUpperCase().slice(0, 2);
    setLocale(nextCountryCode);
    bumpLocaleVersion();
    setLocationField("countryCode", nextCountryCode);
  };

  const runPostalLookup = async () => {
    const zip = location.zipCode.trim();
    if (!zip || lookupLoading) {
      return;
    }
    setLookupLoading(true);
    setLookupError("");
    try {
      const address = await lookupAddressByPostalCode(zip, location.countryCode);
      setLocation((current) => {
        const next: LocationDelivery = {
          ...current,
          ...address,
          zipCode: address.zipCode || current.zipCode,
        };
        const store = resolveStoreForDelivery(next);
        return { ...next, storeId: store?.id ?? "" };
      });
    } catch (e) {
      setLookupError(e instanceof Error ? e.message : "Address lookup failed");
    } finally {
      setLookupLoading(false);
    }
  };

  const handleZipBlur = () => {
    if (shouldAutoLookupPostal(location.zipCode, location.countryCode)) {
      void runPostalLookup();
    }
  };

  const handleSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setError("");
    if (password.length < 8) {
      setError(t("authPasswordTooShort"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("authPasswordMismatch"));
      return;
    }
    if (!location.zipCode.trim() || !location.storeId.trim()) {
      setError(t("locationStoreRequired"));
      return;
    }

    setLoading(true);
    try {
      const user = await signupUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        location,
      });
      setUser(user);
      setOrders([]);
      if (user.location) {
        setLocale(user.location.countryCode);
        setDeliveryFromServer(user.location);
        bumpLocaleVersion();
      }
      setSuccessOpen(true);
      await new Promise((resolve) => setTimeout(resolve, 850));
      setView("profile");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header brandOnly />
      <Container component="main" maxWidth="xs" sx={{ py: { xs: 5, md: 8 } }}>
        <Paper
          component="form"
          noValidate
          onSubmit={handleSubmit}
          elevation={4}
          sx={{ p: { xs: 3, sm: 4 }, borderRadius: 2 }}
        >
          <Stack spacing={2.25}>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
                {t("authSignupTitle")}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                {t("authSignupSubtitle")}
              </Typography>
            </Box>
            {error && <Alert severity="error">{error}</Alert>}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label={t("authFirstName")}
                value={firstName}
                onChange={(ev) => setFirstName(ev.target.value)}
                autoComplete="given-name"
                required
                fullWidth
              />
              <TextField
                label={t("authLastName")}
                value={lastName}
                onChange={(ev) => setLastName(ev.target.value)}
                autoComplete="family-name"
                required
                fullWidth
              />
            </Stack>
            <TextField
              label={t("authEmail")}
              type="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              autoComplete="email"
              required
              fullWidth
            />
            <TextField
              label={t("authPassword")}
              type="password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              autoComplete="new-password"
              required
              fullWidth
            />
            <TextField
              label={t("authConfirmPassword")}
              type="password"
              value={confirmPassword}
              onChange={(ev) => setConfirmPassword(ev.target.value)}
              autoComplete="new-password"
              required
              fullWidth
            />
            <TextField
              select
              label={t("locationCountryLabel")}
              value={location.countryCode}
              onChange={(ev) => handleCountryChange(ev.target.value)}
              fullWidth
            >
              <MenuItem value="US">{t("locationCountryUS")}</MenuItem>
              <MenuItem value="BR">{t("locationCountryBR")}</MenuItem>
            </TextField>
            <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
              <TextField
                label={t("locationZip")}
                value={location.zipCode}
                onChange={(ev) => setLocationField("zipCode", ev.target.value)}
                onBlur={handleZipBlur}
                required
                fullWidth
                slotProps={{
                  htmlInput: {
                    inputMode: "numeric",
                    autoComplete: "postal-code",
                  },
                }}
              />
              <Button
                variant="contained"
                disabled={lookupLoading}
                onClick={() => void runPostalLookup()}
                startIcon={
                  lookupLoading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <SearchRoundedIcon />
                  )
                }
                sx={{ minHeight: 56, flexShrink: 0 }}
              >
                {lookupLoading ? t("locationLookingUp") : t("locationLookupBtn")}
              </Button>
            </Stack>
            {lookupError && <Alert severity="error">{lookupError}</Alert>}
            <StoreStatus
              countryCode={location.countryCode}
              city={location.city}
              state={location.state}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label={t("locationCity")}
                value={location.city}
                onChange={(ev) => setLocationField("city", ev.target.value)}
                required
                fullWidth
              />
              <TextField
                label={t("locationStateProv")}
                value={location.state}
                onChange={(ev) => setLocationField("state", ev.target.value)}
                required
                fullWidth
              />
            </Stack>
            <TextField
              label={t("locationStreet")}
              value={location.streetLine}
              onChange={(ev) => setLocationField("streetLine", ev.target.value)}
              required
              fullWidth
            />
            <TextField
              label={t("locationComplement")}
              value={location.complement}
              onChange={(ev) => setLocationField("complement", ev.target.value)}
              fullWidth
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<PersonAddRoundedIcon />}
              disabled={loading}
            >
              {t("authCreateAccount")}
            </Button>
            <Button type="button" variant="text" onClick={() => setView("login")}>
              {t("authHaveAccount")} {t("authLogin")}
            </Button>
            <Button
              type="button"
              variant="text"
              startIcon={<PersonOffRoundedIcon />}
              onClick={() => setView("shop")}
            >
              {t("authContinueGuest")}
            </Button>
          </Stack>
        </Paper>
      </Container>
      <AuthSuccessOverlay open={successOpen} message={t("authSignupSuccess")} />
    </>
  );
}
