import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { randomUUID } from "node:crypto";
import {
  brCepDigits,
  normalizePostalForLookup,
  parseAddressFromNominatim,
} from "./geocode.mjs";
import { lookupViaCep } from "./viacep.mjs";

const app = express();
const sessions = new Map();

const SESSION_COOKIE = "bt_sid";
const PORT = Number(process.env.PORT) || 3001;

/** Nominatim requires a descriptive User-Agent (no API key). */
const NOMINATIM_UA =
  process.env.NOMINATIM_USER_AGENT ||
  "BurguerTenders-Training/1.0 (local dev; https://github.com/)";

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

function emptyDelivery() {
  return {
    zipCode: "",
    countryCode: "US",
    streetLine: "",
    neighborhood: "",
    city: "",
    state: "",
    country: "",
    complement: "",
    storeId: "",
  };
}

function normalizeDelivery(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const d = emptyDelivery();
  for (const k of Object.keys(d)) {
    if (raw[k] != null && typeof raw[k] === "string") {
      d[k] = raw[k];
    }
  }
  if (raw.countryCode && typeof raw.countryCode === "string") {
    d.countryCode = raw.countryCode.toUpperCase().slice(0, 2);
  }
  return d;
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

async function nominatimSearch(params) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "5");
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== "") {
      url.searchParams.set(k, String(v));
    }
  }

  const r = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": NOMINATIM_UA,
    },
  });

  if (!r.ok) {
    return null;
  }

  const data = await r.json();
  return Array.isArray(data) && data.length > 0 ? data : null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Nominatim's `postalcode=` misses many BR CEPs. Try several query shapes (OSM policy: ~1 req/s — we only chain on empty).
 */
async function searchNominatimForPostal(postalCode, countryCode) {
  const cc = countryCode.toUpperCase().slice(0, 2);
  const normalized = normalizePostalForLookup(postalCode, cc);
  const countryLower = cc.toLowerCase();

  const attempts = [];

  if (cc === "BR") {
    const digits = brCepDigits(postalCode);
    attempts.push({ postalcode: normalized, countrycodes: countryLower });
    if (digits) {
      attempts.push({ postalcode: digits, countrycodes: countryLower });
      attempts.push({ q: `${digits}, Brasil`, countrycodes: countryLower });
      attempts.push({ q: `${normalized}, Brasil`, countrycodes: countryLower });
      attempts.push({ q: digits, countrycodes: countryLower });
    }
  } else {
    attempts.push({ postalcode: normalized, countrycodes: countryLower });
  }

  for (let i = 0; i < attempts.length; i++) {
    if (i > 0) {
      await sleep(350);
    }
    const hits = await nominatimSearch(attempts[i]);
    if (hits?.length) {
      const best =
        hits.find((h) => h.address?.postcode) ||
        hits.find((h) => h.address?.city || h.address?.town) ||
        hits[0];
      return { hit: best, fallbackPostal: normalized };
    }
  }

  return null;
}

app.get("/api/geocode", async (req, res) => {
  const postalCode = String(req.query.postalCode || "").trim();
  const countryCode = String(req.query.countryCode || "US").toUpperCase().slice(0, 2);
  if (!postalCode) {
    return res.status(400).json({ error: "postalCode is required" });
  }

  const normalized = normalizePostalForLookup(postalCode, countryCode);

  try {
    // Brazil: ViaCEP has full national CEP coverage; OpenStreetMap often misses CEP centroids.
    if (countryCode === "BR") {
      const digits = brCepDigits(postalCode);
      if (digits) {
        const via = await lookupViaCep(digits);
        if (via) {
          return res.json({ address: via, provider: "viacep" });
        }
      }
    }

    const found = await searchNominatimForPostal(postalCode, countryCode);
    if (!found) {
      return res.status(404).json({
        error:
          "No address found for this postal code. For Brazil use 8 digits; for US use 5 digits.",
      });
    }

    const parsed = parseAddressFromNominatim(found.hit, normalized);
    res.json({ address: parsed, provider: "nominatim" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Geocoding request failed";
    res.status(502).json({ error: msg });
  }
});

app.get("/api/delivery", (req, res) => {
  const sid = req.cookies[SESSION_COOKIE];
  if (!sid || !sessions.has(sid)) {
    return res.json({ delivery: null });
  }
  res.json({ delivery: normalizeDelivery(sessions.get(sid)) });
});

app.post("/api/delivery", (req, res) => {
  const body = req.body || {};
  const zipCode = typeof body.zipCode === "string" ? body.zipCode.trim() : "";
  if (!zipCode) {
    return res.status(400).json({ error: "ZIP / postal code is required" });
  }

  let sid = req.cookies[SESSION_COOKIE];
  if (!sid) {
    sid = randomUUID();
    res.cookie(SESSION_COOKIE, sid, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  const cc =
    typeof body.countryCode === "string" && body.countryCode.length >= 2
      ? body.countryCode.toUpperCase().slice(0, 2)
      : "US";

  const payload = {
    zipCode,
    countryCode: cc,
    streetLine: typeof body.streetLine === "string" ? body.streetLine.trim() : "",
    neighborhood: typeof body.neighborhood === "string" ? body.neighborhood.trim() : "",
    city: typeof body.city === "string" ? body.city.trim() : "",
    state: typeof body.state === "string" ? body.state.trim() : "",
    country: typeof body.country === "string" ? body.country.trim() : "",
    complement: typeof body.complement === "string" ? body.complement.trim() : "",
    storeId:
      typeof body.storeId === "string" ? body.storeId.trim().slice(0, 64) : "",
  };

  sessions.set(sid, payload);
  res.json({ delivery: payload });
});

app.listen(PORT, () => {
  console.log(`Burguer-Tenders API listening on http://localhost:${PORT}`);
});
