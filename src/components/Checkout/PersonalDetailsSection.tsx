import { Paper, Stack, TextField, Typography } from "@mui/material";
import { useCheckoutStore } from "../../stores/checkoutStore";
import { t } from "../../i18n/locale";

export function PersonalDetailsSection() {
  const fullName = useCheckoutStore((s) => s.form.fullName);
  const email = useCheckoutStore((s) => s.form.email);
  const errors = useCheckoutStore((s) => s.errors);
  const setField = useCheckoutStore((s) => s.setField);

  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
        {t("checkoutSectionDetails")}
      </Typography>
      <Stack spacing={2}>
        <TextField
          id="checkout-name"
          name="fullName"
          placeholder={t("checkoutName")}
          value={fullName}
          onChange={(e) => setField("fullName", e.target.value)}
          error={Boolean(errors.fullName)}
          helperText={errors.fullName}
          slotProps={{
            htmlInput: {
              "data-checkout-field": "fullName",
              "data-testid": "checkout-name",
              "aria-label": t("checkoutName"),
              autoComplete: "name",
            },
            formHelperText: errors.fullName
              ? {
                  role: "alert",
                  "data-testid": "checkout-error-fullName",
                }
              : undefined,
          }}
        />
        <TextField
          id="checkout-email"
          name="email"
          type="email"
          placeholder={t("checkoutEmail")}
          value={email}
          onChange={(e) => setField("email", e.target.value)}
          error={Boolean(errors.email)}
          helperText={errors.email}
          slotProps={{
            htmlInput: {
              "data-checkout-field": "email",
              "data-testid": "checkout-email",
              "aria-label": t("checkoutEmail"),
              autoComplete: "email",
            },
            formHelperText: errors.email
              ? {
                  role: "alert",
                  "data-testid": "checkout-error-email",
                }
              : undefined,
          }}
        />
      </Stack>
    </Paper>
  );
}
