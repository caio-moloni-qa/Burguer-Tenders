import { useEffect, useRef, useState } from "react";
import { Box, Fade, IconButton, TextField, Tooltip } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useUiStore } from "../../stores/uiStore";
import { t } from "../../i18n/locale";

export function MenuSearch() {
  const searchQuery = useUiStore((s) => s.menuSearch);
  const setMenuSearch = useUiStore((s) => s.setMenuSearch);
  const [open, setOpen] = useState(searchQuery.length > 0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      window.requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const handleClose = () => {
    setMenuSearch("");
    setOpen(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        mb: 2,
        minHeight: 42,
      }}
    >
      {!open ? (
        <Fade in timeout={180}>
          <Box>
            <Tooltip title={t("menuSearchLabel")}>
              <IconButton
                onClick={() => setOpen(true)}
                aria-label={t("menuSearchLabel")}
                data-testid="menu-search-toggle"
                sx={{
                  width: 42,
                  height: 42,
                  color: "common.white",
                  border: "1px solid",
                  borderColor: "rgba(246, 196, 83, 0.22)",
                  bgcolor: "rgba(17, 10, 7, 0.74)",
                  boxShadow: "0 10px 24px rgba(0,0,0,0.2)",
                  transition:
                    "transform 180ms ease, background-color 180ms ease, border-color 180ms ease",
                  "&:hover": {
                    bgcolor: "rgba(246, 196, 83, 0.12)",
                    borderColor: "rgba(246, 196, 83, 0.38)",
                    transform: "translateY(-1px) scale(1.04)",
                  },
                }}
              >
                <SearchRoundedIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Fade>
      ) : (
        <Box
          sx={{
            width: { xs: "min(100%, 19rem)", sm: 320 },
            animation: "menuSearchExpand 240ms cubic-bezier(0.2, 0.8, 0.2, 1)",
            transformOrigin: "center",
            "@keyframes menuSearchExpand": {
              "0%": {
                opacity: 0,
                transform: "scaleX(0.18) translateY(-2px)",
              },
              "65%": {
                opacity: 1,
                transform: "scaleX(1.03) translateY(0)",
              },
              "100%": {
                opacity: 1,
                transform: "scaleX(1) translateY(0)",
              },
            },
          }}
        >
          <TextField
            id="menu-search"
            type="search"
            placeholder={t("menuSearchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setMenuSearch(e.target.value)}
            autoComplete="off"
            inputRef={inputRef}
            slotProps={{
              input: {
                "aria-label": t("menuSearchLabel"),
                startAdornment: <SearchRoundedIcon fontSize="small" />,
                endAdornment: (
                  <IconButton
                    size="small"
                    onClick={handleClose}
                    aria-label="Close search"
                    data-testid="menu-search-close"
                    edge="end"
                  >
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                ),
              },
              htmlInput: {
                "data-menu-search": "",
                "data-testid": "menu-search",
              },
            }}
            sx={{
              width: "100%",
              "& .MuiOutlinedInput-root": {
                borderRadius: 999,
                pr: 0.75,
                transition:
                  "box-shadow 180ms ease, border-color 180ms ease, background-color 180ms ease",
                "&.Mui-focused": {
                  boxShadow: "0 0 0 3px rgba(246, 196, 83, 0.12)",
                },
              },
              "& .MuiInputBase-input": {
                py: 1,
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
}
