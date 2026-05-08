import { Backdrop, Fade, Paper, Stack, Typography, Zoom } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

type AuthSuccessOverlayProps = {
  open: boolean;
  message: string;
};

export function AuthSuccessOverlay({ open, message }: AuthSuccessOverlayProps) {
  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 20,
        backgroundColor: "rgba(8, 5, 3, 0.64)",
        backdropFilter: "blur(5px)",
      }}
    >
      <Fade in={open} timeout={240}>
        <Paper
          elevation={8}
          sx={{
            width: "min(88vw, 22rem)",
            p: 4,
            textAlign: "center",
            borderRadius: 2,
          }}
        >
          <Stack spacing={1.5} sx={{ alignItems: "center" }}>
            <Zoom in={open} timeout={420}>
              <CheckCircleRoundedIcon
                color="success"
                sx={{ fontSize: 64, filter: "drop-shadow(0 8px 18px rgba(46, 125, 50, 0.24))" }}
              />
            </Zoom>
            <Typography variant="h5" component="p" sx={{ fontWeight: 800 }}>
              {message}
            </Typography>
          </Stack>
        </Paper>
      </Fade>
    </Backdrop>
  );
}
