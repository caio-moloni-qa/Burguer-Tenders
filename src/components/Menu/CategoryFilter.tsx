import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import AppsRoundedIcon from "@mui/icons-material/AppsRounded";
import DinnerDiningRoundedIcon from "@mui/icons-material/DinnerDiningRounded";
import FastfoodRoundedIcon from "@mui/icons-material/FastfoodRounded";
import KebabDiningRoundedIcon from "@mui/icons-material/KebabDiningRounded";
import LocalDrinkRoundedIcon from "@mui/icons-material/LocalDrinkRounded";
import LunchDiningRoundedIcon from "@mui/icons-material/LunchDiningRounded";
import { useUiStore, type MenuFilter } from "../../stores/uiStore";
import { t, type TranslationKey } from "../../i18n/locale";

const FILTER_LABELS: Record<MenuFilter, TranslationKey> = {
  all: "categoryAll",
  burger: "categoryBurger",
  tenders: "categoryTender",
  combo: "categoryCombo",
  drink: "categoryDrink",
  side: "categorySide",
};

const FILTERS: Array<{
  value: MenuFilter;
  icon: typeof AppsRoundedIcon;
}> = [
  { value: "all", icon: AppsRoundedIcon },
  { value: "burger", icon: LunchDiningRoundedIcon },
  { value: "tenders", icon: KebabDiningRoundedIcon },
  { value: "combo", icon: FastfoodRoundedIcon },
  { value: "drink", icon: LocalDrinkRoundedIcon },
  { value: "side", icon: DinnerDiningRoundedIcon },
];

export function CategoryFilter() {
  const activeFilter = useUiStore((s) => s.menuFilter);
  const setMenuFilter = useUiStore((s) => s.setMenuFilter);

  return (
    <Box
      aria-label={t("menuCategoryLabel")}
      data-menu-filter=""
      data-testid="menu-category-filter"
      sx={{
        maxWidth: "100%",
        overflowX: "auto",
        pb: 0.5,
        scrollbarWidth: "thin",
      }}
    >
      <ToggleButtonGroup
        exclusive
        value={activeFilter}
        onChange={(_, value: MenuFilter | null) => {
          if (value) {
            setMenuFilter(value);
          }
        }}
        size="small"
        aria-label={t("menuCategoryLabel")}
        sx={{
          display: "inline-flex",
          p: 0.5,
          gap: 0.5,
          border: "1px solid",
          borderColor: "rgba(246, 196, 83, 0.18)",
          borderRadius: 999,
          bgcolor: "rgba(17, 10, 7, 0.74)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.22)",
          "& .MuiToggleButtonGroup-grouped": {
            border: 0,
            mx: 0,
            borderRadius: "999px !important",
          },
        }}
      >
        {FILTERS.map(({ value, icon: Icon }) => {
          const label = t(FILTER_LABELS[value]);
          return (
            <Tooltip key={value} title={label}>
              <ToggleButton
                value={value}
                aria-label={label}
                data-testid={`menu-category-filter-${value}`}
                data-filter-value={value}
                sx={{
                  gap: 0.75,
                  minWidth: { xs: 44, sm: "auto" },
                  minHeight: 36,
                  px: { xs: 1.1, sm: 1.5 },
                  color: "text.secondary",
                  whiteSpace: "nowrap",
                  "&.Mui-selected": {
                    color: "primary.contrastText",
                    bgcolor: "primary.main",
                    boxShadow: "0 8px 18px rgba(199, 119, 56, 0.26)",
                    "&:hover": {
                      bgcolor: "primary.light",
                    },
                  },
                  "&:hover": {
                    bgcolor: "rgba(246, 196, 83, 0.1)",
                    color: "text.primary",
                  },
                }}
              >
                <Icon fontSize="small" />
                <Typography
                  component="span"
                  variant="caption"
                  sx={{
                    display: { xs: value === activeFilter ? "inline" : "none", sm: "inline" },
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {label}
                </Typography>
              </ToggleButton>
            </Tooltip>
          );
        })}
      </ToggleButtonGroup>
    </Box>
  );
}
