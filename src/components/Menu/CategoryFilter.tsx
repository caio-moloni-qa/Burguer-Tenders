import { MenuItem, TextField } from "@mui/material";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
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

const FILTERS: MenuFilter[] = ["all", "burger", "tenders", "combo", "drink", "side"];

export function CategoryFilter() {
  const activeFilter = useUiStore((s) => s.menuFilter);
  const setMenuFilter = useUiStore((s) => s.setMenuFilter);

  return (
    <TextField
      select
      id="menu-category-filter"
      value={activeFilter}
      onChange={(e) => setMenuFilter(e.target.value as MenuFilter)}
      slotProps={{
        select: {
          IconComponent: CategoryRoundedIcon,
          inputProps: {
            "data-menu-filter": "",
            "data-testid": "menu-category-filter",
            "aria-label": t("menuCategoryLabel"),
          },
        },
      }}
      sx={{ minWidth: 180 }}
    >
      {FILTERS.map((f) => (
        <MenuItem key={f} value={f}>
          {t(FILTER_LABELS[f])}
        </MenuItem>
      ))}
    </TextField>
  );
}
