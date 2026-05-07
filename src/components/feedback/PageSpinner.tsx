import { Backdrop, CircularProgress } from "@mui/material";
import { useUiStore } from "../../stores/uiStore";

export function PageSpinner() {
  const visible = useUiStore((s) => s.pageSpinnerVisible);

  return (
    <Backdrop
      open={visible}
      data-testid="page-spinner"
      aria-label="Loading"
      sx={{
        color: "primary.contrastText",
        zIndex: (theme) => theme.zIndex.modal + 10,
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(2px)",
      }}
    >
      <CircularProgress color="primary" thickness={4.5} size={56} />
    </Backdrop>
  );
}
