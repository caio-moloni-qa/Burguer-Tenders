import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import { fetchPreviousOrders, logoutUser, updateUserProfile } from "../../api/authApi";
import { getProductById } from "../../data/products";
import { formatPrice, productName, t } from "../../i18n/locale";
import { useAuthStore } from "../../stores/authStore";
import { useCartStore } from "../../stores/cartStore";
import type { LocationDelivery } from "../../stores/locationStore";
import { useLocationStore } from "../../stores/locationStore";
import { useUiStore } from "../../stores/uiStore";
import type { PreviousOrder } from "../../types/auth";
import { Header } from "../Header/Header";

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

function orderLabel(order: PreviousOrder): string {
  const date = new Date(order.orderedAt);
  return `${date.toLocaleDateString()} - ${formatPrice(order.totalUsd)}`;
}

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const orders = useAuthStore((s) => s.orders);
  const setUser = useAuthStore((s) => s.setUser);
  const setOrders = useAuthStore((s) => s.setOrders);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const addCustomizedProduct = useCartStore((s) => s.addCustomizedProduct);
  const setDeliveryFromServer = useLocationStore((s) => s.setDeliveryFromServer);
  const setView = useUiStore((s) => s.setView);
  const [tab, setTab] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<PreviousOrder | null>(null);
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [location, setLocation] = useState<LocationDelivery>(
    user?.location ?? emptyLocation
  );

  useEffect(() => {
    if (!user) {
      return;
    }
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setLocation(user.location ?? emptyLocation);
    void fetchPreviousOrders().then(setOrders).catch(() => undefined);
  }, [setOrders, user]);

  const selectedLines = useMemo(
    () => selectedOrder?.lines ?? [],
    [selectedOrder]
  );

  if (!user) {
    return (
      <>
        <Header />
        <Container maxWidth="sm" sx={{ py: 4 }}>
          <Alert severity="info">{t("authLoginRequired")}</Alert>
          <Button sx={{ mt: 2 }} variant="contained" onClick={() => setView("login")}>
            {t("authLogin")}
          </Button>
        </Container>
      </>
    );
  }

  const updateLocation = <K extends keyof LocationDelivery>(
    field: K,
    value: LocationDelivery[K]
  ) => {
    setLocation((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    setError("");
    setMessage("");
    try {
      const updated = await updateUserProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        location,
      });
      setUser(updated);
      if (updated.location) {
        setDeliveryFromServer(updated.location);
      }
      setMessage(t("authSaveChanges"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Profile update failed");
    }
  };

  const handleLogout = async () => {
    await logoutUser().catch(() => undefined);
    clearAuth();
    setView("shop");
  };

  const reorder = (order: PreviousOrder) => {
    for (const line of order.lines) {
      addCustomizedProduct(line);
    }
    setSelectedOrder(null);
    setView("shop");
  };

  return (
    <>
      <Header />
      <Container component="main" maxWidth="md" sx={{ py: { xs: 3, md: 4 } }}>
        <Stack spacing={2.5}>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
              {t("authProfile")}
            </Typography>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<LogoutRoundedIcon />}
              onClick={handleLogout}
            >
              {t("authLogout")}
            </Button>
          </Box>
          <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
            <Tabs value={tab} onChange={(_ev, next) => setTab(next)} sx={{ mb: 2 }}>
              <Tab label={t("authAccountDetails")} />
              <Tab label={t("authPreviousOrders")} />
            </Tabs>
            {tab === 0 && (
              <Stack spacing={2}>
                {error && <Alert severity="error">{error}</Alert>}
                {message && <Alert severity="success">{message}</Alert>}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    label={t("authFirstName")}
                    value={firstName}
                    onChange={(ev) => setFirstName(ev.target.value)}
                    fullWidth
                  />
                  <TextField
                    label={t("authLastName")}
                    value={lastName}
                    onChange={(ev) => setLastName(ev.target.value)}
                    fullWidth
                  />
                </Stack>
                <TextField
                  label={t("authEmail")}
                  type="email"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  fullWidth
                />
                <Divider />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    label={t("locationZip")}
                    value={location.zipCode}
                    onChange={(ev) => updateLocation("zipCode", ev.target.value)}
                    fullWidth
                  />
                  <TextField
                    label={t("locationCountryLabel")}
                    value={location.countryCode}
                    onChange={(ev) => updateLocation("countryCode", ev.target.value)}
                    fullWidth
                  />
                </Stack>
                <TextField
                  label={t("locationStreet")}
                  value={location.streetLine}
                  onChange={(ev) => updateLocation("streetLine", ev.target.value)}
                  fullWidth
                />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    label={t("locationNeighborhood")}
                    value={location.neighborhood}
                    onChange={(ev) => updateLocation("neighborhood", ev.target.value)}
                    fullWidth
                  />
                  <TextField
                    label={t("locationCity")}
                    value={location.city}
                    onChange={(ev) => updateLocation("city", ev.target.value)}
                    fullWidth
                  />
                  <TextField
                    label={t("locationStateProv")}
                    value={location.state}
                    onChange={(ev) => updateLocation("state", ev.target.value)}
                    fullWidth
                  />
                </Stack>
                <TextField
                  label={t("locationComplement")}
                  value={location.complement}
                  onChange={(ev) => updateLocation("complement", ev.target.value)}
                  fullWidth
                />
                <Button
                  variant="contained"
                  startIcon={<SaveRoundedIcon />}
                  onClick={handleSave}
                  sx={{ alignSelf: "flex-start" }}
                >
                  {t("authSaveChanges")}
                </Button>
              </Stack>
            )}
            {tab === 1 && (
              <List disablePadding>
                {orders.length === 0 && (
                  <Typography color="text.secondary">{t("authNoOrders")}</Typography>
                )}
                {orders.map((order) => (
                  <ListItemButton
                    key={order.id}
                    divider
                    onClick={() => setSelectedOrder(order)}
                  >
                    <ListItemText
                      primary={orderLabel(order)}
                      secondary={t("authItemCount", {
                        count: String(order.lines.length),
                      })}
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Paper>
        </Stack>
      </Container>
      <Dialog
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t("authOrderDetails")}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            {selectedLines.map((line, index) => {
              const product = getProductById(line.productId);
              return (
                <Box key={`${line.productId}-${index}`}>
                  <Typography sx={{ fontWeight: 700 }}>
                    {line.quantity} x {product ? productName(product) : line.productId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatPrice(line.unitPriceUsd)}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedOrder(null)}>{t("authClose")}</Button>
          {selectedOrder && (
            <Button
              variant="contained"
              startIcon={<ShoppingBagRoundedIcon />}
              onClick={() => reorder(selectedOrder)}
            >
              {t("authReorder")}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
