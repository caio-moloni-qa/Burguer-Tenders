import {
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import VolunteerActivismRoundedIcon from "@mui/icons-material/VolunteerActivismRounded";
import {
  DONATION_ASSOCIATION,
  DONATION_FIXED_OPTIONS,
  DONATION_PERCENT_OPTIONS,
  type DonationType,
  useCheckoutStore,
} from "../../stores/checkoutStore";
import { formatPrice, fromDisplayPrice, t } from "../../i18n/locale";

export function DonationSection() {
  const f = useCheckoutStore((s) => s.form);
  const setField = useCheckoutStore((s) => s.setField);

  const setPreset = (type: Exclude<DonationType, "none">, amount: number) => {
    setField("donationType", type);
    setField("donationAmount", amount);
    setField("donationCustomFixed", "");
    setField("donationCustomPercent", "");
  };

  const setNone = () => {
    setField("donationType", "none");
    setField("donationAmount", 0);
    setField("donationCustomFixed", "");
    setField("donationCustomPercent", "");
  };

  const handleCustomChange = (kind: "fixed" | "percent", raw: string) => {
    const parsed = parseFloat(raw);
    const valid = raw !== "" && !Number.isNaN(parsed) && parsed > 0;

    if (kind === "fixed") {
      setField("donationCustomFixed", raw);
      setField("donationCustomPercent", "");
      setField("donationType", valid ? "fixed" : "none");
      setField("donationAmount", valid ? fromDisplayPrice(parsed) : 0);
    } else {
      setField("donationCustomPercent", raw);
      setField("donationCustomFixed", "");
      setField("donationType", valid ? "percent" : "none");
      setField("donationAmount", valid ? parsed : 0);
    }
  };

  const isPresetActive = (type: "fixed" | "percent", amount: number) => {
    const noCustom =
      type === "fixed" ? f.donationCustomFixed === "" : f.donationCustomPercent === "";
    return f.donationType === type && f.donationAmount === amount && noCustom;
  };

  return (
    <Box data-testid="checkout-donation">
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: "center", mb: 1.5 }}
      >
        <VolunteerActivismRoundedIcon fontSize="small" color="primary" />
        <Typography variant="body2">
          {t("checkoutDonation")} <strong>{DONATION_ASSOCIATION}</strong>
        </Typography>
      </Stack>

      <Stack spacing={2} sx={{ mb: 1.5 }}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
            {t("checkoutDonationFixed")}
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ flexWrap: "wrap" }}
          >
            <ToggleButtonGroup
              size="small"
              value={
                isPresetActive("fixed", DONATION_FIXED_OPTIONS[0]) ||
                isPresetActive("fixed", DONATION_FIXED_OPTIONS[1]) ||
                isPresetActive("fixed", DONATION_FIXED_OPTIONS[2])
                  ? f.donationAmount
                  : null
              }
              exclusive
              aria-label={t("checkoutDonationFixed")}
            >
              {DONATION_FIXED_OPTIONS.map((amt) => (
                <ToggleButton
                  key={amt}
                  value={amt}
                  selected={isPresetActive("fixed", amt)}
                  onClick={() => setPreset("fixed", amt)}
                  data-action="set-donation"
                  data-donation-type="fixed"
                  data-donation-amount={amt}
                  data-testid={`donation-fixed-${amt}`}
                >
                  {formatPrice(amt)}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <TextField
              type="number"
              size="small"
              placeholder={t("checkoutDonationCustom")}
              value={f.donationCustomFixed}
              onChange={(e) => handleCustomChange("fixed", e.target.value)}
              aria-label={`${t("checkoutDonationFixed")} — ${t("checkoutDonationCustom")}`}
              fullWidth={false}
              slotProps={{
                htmlInput: {
                  "data-donation-custom": "fixed",
                  "data-testid": "donation-custom-fixed",
                  min: 0.01,
                  step: 0.01,
                },
              }}
              sx={{ width: 130 }}
            />
          </Stack>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
            {t("checkoutDonationPercent")}
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ flexWrap: "wrap" }}
          >
            <ToggleButtonGroup
              size="small"
              value={
                isPresetActive("percent", DONATION_PERCENT_OPTIONS[0]) ||
                isPresetActive("percent", DONATION_PERCENT_OPTIONS[1]) ||
                isPresetActive("percent", DONATION_PERCENT_OPTIONS[2])
                  ? f.donationAmount
                  : null
              }
              exclusive
              aria-label={t("checkoutDonationPercent")}
            >
              {DONATION_PERCENT_OPTIONS.map((pct) => (
                <ToggleButton
                  key={pct}
                  value={pct}
                  selected={isPresetActive("percent", pct)}
                  onClick={() => setPreset("percent", pct)}
                  data-action="set-donation"
                  data-donation-type="percent"
                  data-donation-amount={pct}
                  data-testid={`donation-percent-${pct}`}
                >
                  {pct}%
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <TextField
              type="number"
              size="small"
              placeholder={t("checkoutDonationCustom")}
              value={f.donationCustomPercent}
              onChange={(e) => handleCustomChange("percent", e.target.value)}
              aria-label={`${t("checkoutDonationPercent")} — ${t("checkoutDonationCustom")}`}
              fullWidth={false}
              slotProps={{
                htmlInput: {
                  "data-donation-custom": "percent",
                  "data-testid": "donation-custom-percent",
                  min: 0.01,
                  max: 100,
                  step: 0.01,
                },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                },
              }}
              sx={{ width: 130 }}
            />
          </Stack>
        </Box>
      </Stack>
      <Button
        variant={f.donationType === "none" ? "outlined" : "text"}
        color="inherit"
        size="small"
        onClick={setNone}
        data-action="set-donation"
        data-donation-type="none"
        data-testid="donation-none"
      >
        {t("checkoutDonationNone")}
      </Button>
    </Box>
  );
}
