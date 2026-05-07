import { InputAdornment, TextField } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useUiStore } from "../../stores/uiStore";
import { t } from "../../i18n/locale";

export function MenuSearch() {
  const searchQuery = useUiStore((s) => s.menuSearch);
  const setMenuSearch = useUiStore((s) => s.setMenuSearch);

  return (
    <TextField
      id="menu-search"
      type="search"
      placeholder={t("menuSearchPlaceholder")}
      value={searchQuery}
      onChange={(e) => setMenuSearch(e.target.value)}
      autoComplete="off"
      slotProps={{
        input: {
          "aria-label": t("menuSearchLabel"),
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon fontSize="small" />
            </InputAdornment>
          ),
        },
        htmlInput: {
          "data-menu-search": "",
          "data-testid": "menu-search",
        },
      }}
      sx={{ mb: 2 }}
    />
  );
}
