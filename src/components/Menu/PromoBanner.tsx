import { useCallback, useEffect, useState } from "react";
import { Box, Stack, Typography, useMediaQuery } from "@mui/material";
import { t, type TranslationKey } from "../../i18n/locale";
import { promos, type PromoContent } from "../../data/promos";

type Promo = PromoContent & {
  headlineKey: TranslationKey;
  sublineKey: TranslationKey;
  eyebrowKey: TranslationKey;
};

const PROMO_TEXT_KEYS: Record<
  string,
  Pick<Promo, "eyebrowKey" | "headlineKey" | "sublineKey">
> = {
  combo: {
    eyebrowKey: "promoComboEyebrow",
    headlineKey: "promoComboHeadline",
    sublineKey: "promoComboSubline",
  },
  spicy: {
    eyebrowKey: "promoSpicyEyebrow",
    headlineKey: "promoSpicyHeadline",
    sublineKey: "promoSpicySubline",
  },
  delivery: {
    eyebrowKey: "promoDeliveryEyebrow",
    headlineKey: "promoDeliveryHeadline",
    sublineKey: "promoDeliverySubline",
  },
};

const ROTATE_MS = 5500;

/**
 * Dark left-to-right gradient overlay so the headline always reads cleanly
 * over the lifestyle photo behind it.
 */
const TEXT_MASK =
  "linear-gradient(95deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0) 78%)";

export function PromoBanner() {
  const activePromos = promos
    .map((promo) => {
      const keys = PROMO_TEXT_KEYS[promo.id];
      return keys ? { ...promo, ...keys } : null;
    })
    .filter((promo): promo is Promo => promo != null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)"
  );

  const goTo = useCallback((next: number) => {
    setIndex(((next % activePromos.length) + activePromos.length) % activePromos.length);
  }, [activePromos.length]);

  useEffect(() => {
    if (paused || prefersReducedMotion || activePromos.length === 0) {
      return;
    }
    const id = window.setInterval(
      () => setIndex((p) => (p + 1) % activePromos.length),
      ROTATE_MS
    );
    return () => window.clearInterval(id);
  }, [paused, prefersReducedMotion, activePromos.length]);

  if (activePromos.length === 0) {
    return null;
  }

  return (
    <Box
      data-testid="promo-banner"
      role="region"
      aria-roledescription="carousel"
      aria-label={t("promoRegionLabel")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      sx={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        height: "clamp(220px, 22vw, 460px)",
        backgroundColor: "#1a1a1a",
      }}
    >
      {activePromos.map((promo, i) => (
        <PromoSlide
          key={promo.id}
          promo={promo}
          active={i === index}
          prefersReducedMotion={prefersReducedMotion}
        />
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
        {activePromos.map((promo, i) => (
          <Box
            key={promo.id}
            component="button"
            type="button"
            onClick={() => goTo(i)}
            data-testid={`promo-dot-${i}`}
            aria-label={t("promoDotLabel", {
              index: String(i + 1),
              total: String(activePromos.length),
            })}
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

function PromoSlide({
  promo,
  active,
  prefersReducedMotion,
}: {
  promo: Promo;
  active: boolean;
  prefersReducedMotion: boolean;
}) {
  const subline = t(promo.sublineKey);

  return (
    <Box
      data-testid={`promo-slide-${promo.id}`}
      aria-hidden={!active}
      aria-live={active ? "polite" : "off"}
      sx={{
        position: "absolute",
        inset: 0,
        opacity: active ? 1 : 0,
        transition: prefersReducedMotion ? "none" : "opacity 700ms ease-in-out",
        pointerEvents: active ? "auto" : "none",
      }}
    >
      <Box
        role="img"
        aria-label={subline}
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("${promo.imageSrc}")`,
          backgroundSize: "cover",
          backgroundPosition: promo.imagePosition,
          backgroundRepeat: "no-repeat",
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          background: TEXT_MASK,
          pointerEvents: "none",
        }}
      />
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
          {t(promo.eyebrowKey)}
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
          {t(promo.headlineKey)}
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
          {subline}
        </Typography>
      </Stack>
    </Box>
  );
}
