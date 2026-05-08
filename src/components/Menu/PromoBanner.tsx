import { useCallback, useEffect, useState } from "react";
import { Box, Stack, Typography, useMediaQuery } from "@mui/material";

type Promo = {
  id: string;
  headline: string;
  subline: string;
  imageSrc: string;
  /**
   * `background-position` for the photo. Tweak per-image so the subject
   * stays on the right while the dark left side keeps copyspace clean.
   */
  imagePosition: string;
  /** Eyebrow line (small uppercase tagline above the headline). */
  eyebrow: string;
};

const PROMOS: Promo[] = [
  {
    id: "combo",
    eyebrow: "Featured combo",
    headline: "Protein is never enough.",
    subline: "Try out BeeTee's burger and tenders combo.",
    imageSrc: "/images/promos/promo-combo.jpg",
    imagePosition: "75% 35%",
  },
  {
    id: "spicy",
    eyebrow: "Heat lovers",
    headline: "Turn up the heat.",
    subline: "Our Spicy Tenders pack: bold flavor, crispy bite.",
    imageSrc: "/images/promos/promo-spicy.jpg",
    imagePosition: "75% 28%",
  },
  {
    id: "delivery",
    eyebrow: "On us",
    headline: "Free delivery over $25.",
    subline: "Add a few favorites — we'll bring them to your door.",
    imageSrc: "/images/promos/promo-delivery.jpg",
    imagePosition: "60% 38%",
  },
];

const ROTATE_MS = 5500;

/**
 * Dark left-to-right gradient overlay so the headline always reads cleanly
 * over the lifestyle photo behind it. The mask is intentionally aggressive
 * on the left (where the text sits) and fades fully transparent past 70%
 * so the subject remains untouched.
 */
const TEXT_MASK =
  "linear-gradient(95deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0) 78%)";

export function PromoBanner() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)"
  );

  const goTo = useCallback((next: number) => {
    setIndex(((next % PROMOS.length) + PROMOS.length) % PROMOS.length);
  }, []);

  useEffect(() => {
    if (paused || prefersReducedMotion) {
      return;
    }
    const id = window.setInterval(
      () => setIndex((p) => (p + 1) % PROMOS.length),
      ROTATE_MS
    );
    return () => window.clearInterval(id);
  }, [paused, prefersReducedMotion, index]);

  return (
    <Box
      data-testid="promo-banner"
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotions"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      sx={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        // Scale the height with viewport width so the banner stays a
        // cinematic ~4.5:1 ratio on wide monitors instead of a thin sliver
        // that forces the photo to over-zoom into the subject's face.
        // Clamps keep it sensible on tiny phones (220px floor) and
        // ultra-wide displays (460px ceiling).
        height: "clamp(220px, 22vw, 460px)",
        backgroundColor: "#1a1a1a",
      }}
    >
      {PROMOS.map((p, i) => (
        <Box
          key={p.id}
          data-testid={`promo-slide-${p.id}`}
          aria-hidden={i !== index}
          aria-live={i === index ? "polite" : "off"}
          sx={{
            position: "absolute",
            inset: 0,
            opacity: i === index ? 1 : 0,
            transition: prefersReducedMotion
              ? "none"
              : "opacity 700ms ease-in-out",
            pointerEvents: i === index ? "auto" : "none",
          }}
        >
          {/* Photo backdrop */}
          <Box
            role="img"
            aria-label={p.subline}
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url("${p.imageSrc}")`,
              backgroundSize: "cover",
              backgroundPosition: p.imagePosition,
              backgroundRepeat: "no-repeat",
            }}
          />
          {/* Dark gradient mask for text legibility (left side only). */}
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              background: TEXT_MASK,
              pointerEvents: "none",
            }}
          />
          {/* Copy */}
          <Stack
            spacing={0.75}
            sx={{
              position: "absolute",
              inset: 0,
              px: { xs: 3, sm: 5, md: 6 },
              py: { xs: 2.5, sm: 3.5 },
              justifyContent: "center",
              maxWidth: { xs: "82%", sm: "62%", md: "56%" },
              color: "#ffffff",
              textShadow: "0 2px 12px rgba(0,0,0,0.55)",
            }}
          >
            <Typography
              variant="overline"
              sx={{
                fontWeight: 700,
                letterSpacing: "0.18em",
                color: "secondary.main",
                lineHeight: 1,
                fontSize: { xs: "0.65rem", sm: "0.75rem" },
                textShadow: "0 1px 6px rgba(0,0,0,0.6)",
              }}
            >
              {p.eyebrow}
            </Typography>
            <Typography
              variant="h4"
              component="p"
              sx={{
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                fontSize: { xs: "1.4rem", sm: "1.85rem", md: "2.25rem" },
              }}
            >
              {p.headline}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                opacity: 0.96,
                fontWeight: 500,
                fontSize: { xs: "0.875rem", sm: "1rem", md: "1.05rem" },
                maxWidth: "32ch",
              }}
            >
              {p.subline}
            </Typography>
          </Stack>
        </Box>
      ))}

      <Stack
        direction="row"
        spacing={1}
        sx={{
          position: "absolute",
          bottom: 14,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1,
        }}
      >
        {PROMOS.map((p, i) => (
          <Box
            key={p.id}
            component="button"
            type="button"
            onClick={() => goTo(i)}
            data-testid={`promo-dot-${i}`}
            aria-label={`Show promotion ${i + 1} of ${PROMOS.length}`}
            aria-current={i === index ? "true" : undefined}
            sx={{
              width: i === index ? 28 : 8,
              height: 8,
              borderRadius: 99,
              border: 0,
              padding: 0,
              cursor: "pointer",
              backgroundColor:
                i === index ? "#ffffff" : "rgba(255,255,255,0.55)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
              transition: "all 220ms ease",
              "&:hover": {
                backgroundColor:
                  i === index ? "#ffffff" : "rgba(255,255,255,0.85)",
              },
              "&:focus-visible": {
                outline: "2px solid #ffffff",
                outlineOffset: 2,
              },
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}
