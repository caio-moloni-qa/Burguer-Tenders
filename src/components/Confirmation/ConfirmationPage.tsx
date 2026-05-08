import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import { getStoreDisplayName } from "../../data/stores";
import { useCheckoutStore } from "../../stores/checkoutStore";
import { useLocationStore } from "../../stores/locationStore";
import { useUiStore } from "../../stores/uiStore";
import { t } from "../../i18n/locale";
import { Header } from "../Header/Header";

type AddressRowProps = {
  label: string;
  value: string;
};

function AddressRow({ label, value }: AddressRowProps) {
  if (!value.trim()) {
    return null;
  }
  return (
    <Stack direction="row" spacing={2} sx={{ py: 0.5 }}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ minWidth: 120, fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {value}
      </Typography>
    </Stack>
  );
}

export function ConfirmationPage() {
  const userName = useCheckoutStore((s) => s.confirmedUserName);
  const delivery = useLocationStore((s) => s.delivery);
  const setView = useUiStore((s) => s.setView);

  const cityState = [delivery.city, delivery.state].filter(Boolean).join(", ");
  const storeName = delivery.storeId ? getStoreDisplayName(delivery.storeId) : "";

  return (
    <>
      <Header brandOnly />
      <Container
        component="main"
        maxWidth="sm"
        sx={{ py: { xs: 4, md: 6 } }}
        data-testid="confirmation-page"
      >
        <Card sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={2} sx={{ alignItems: "center", mb: 3 }}>
            <Avatar
              sx={{
                width: 72,
                height: 72,
                bgcolor: "success.main",
                boxShadow: 4,
              }}
            >
              <CheckCircleRoundedIcon sx={{ fontSize: 48 }} />
            </Avatar>
            <Typography
              variant="h4"
              align="center"
              sx={{ fontWeight: 700 }}
              data-testid="confirm-title"
            >
              {t("confirmTitle", { name: userName })}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              align="center"
              data-testid="confirm-subtitle"
            >
              {t("confirmSubtitle")}
            </Typography>
            <Chip
              icon={<AccessTimeRoundedIcon />}
              label={t("confirmEta", { time: "30 min" })}
              color="primary"
              data-testid="confirm-eta"
              sx={{ fontWeight: 600 }}
            />
          </Stack>

          <Divider sx={{ my: 3 }} />

          <CardContent sx={{ p: 0 }} data-testid="confirm-address">
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, mb: 1.5 }}
            >
              {t("confirmDeliveryAddress")}
            </Typography>
            {storeName && (
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", mb: 1.5 }}
              >
                <StorefrontRoundedIcon fontSize="small" color="primary" />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {storeName}
                </Typography>
              </Stack>
            )}
            <Box>
              <AddressRow label={t("checkoutZip")} value={delivery.zipCode} />
              <AddressRow label={t("checkoutStreet")} value={delivery.streetLine} />
              <AddressRow
                label={t("checkoutNeighborhood")}
                value={delivery.neighborhood}
              />
              <AddressRow label={t("checkoutCityState")} value={cityState} />
              <AddressRow label={t("checkoutCountry")} value={delivery.country} />
              <AddressRow
                label={t("checkoutComplement")}
                value={delivery.complement}
              />
            </Box>
          </CardContent>

          <Stack sx={{ alignItems: "center", mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => setView("shop")}
              data-action="go-home"
              data-testid="confirm-back"
            >
              {t("confirmBackToMenu")}
            </Button>
          </Stack>
        </Card>
      </Container>
    </>
  );
}
