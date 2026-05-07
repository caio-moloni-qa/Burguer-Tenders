import { List, ListItem, ListItemText, Typography } from "@mui/material";
import { listStoresForCountry } from "../../data/stores";
import { t } from "../../i18n/locale";

type Props = {
  countryCode: string;
};

export function StoreList({ countryCode }: Props) {
  const stores = listStoresForCountry(countryCode);
  const title =
    countryCode === "BR" ? t("locationStoresTitleBR") : t("locationStoresTitleUS");

  return (
    <>
      <Typography variant="overline" color="text.secondary">
        {title}
      </Typography>
      <List dense disablePadding sx={{ mb: 1 }}>
        {stores.map((s) => {
          const areas = s.serviceAreas
            .map((a) => `${a.city}, ${a.state}`)
            .join(" · ");
          return (
            <ListItem key={s.id} disableGutters sx={{ py: 0.25 }}>
              <ListItemText
                primary={s.displayName}
                secondary={areas}
                slotProps={{
                  primary: { sx: { fontWeight: 600 } },
                  secondary: { variant: "caption" },
                }}
              />
            </ListItem>
          );
        })}
      </List>
    </>
  );
}
