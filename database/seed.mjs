import "dotenv/config";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";

const { Pool } = pg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const connectionString =
  process.env.DATABASE_URL ||
  "postgres://beetee:beetee_dev_password@localhost:5432/beetee_dev";

const PROMOS = [
  {
    id: "combo",
    imageSrc: "/images/promos/promo-combo.jpg",
    imagePosition: "75% 35%",
  },
  {
    id: "spicy",
    imageSrc: "/images/promos/promo-spicy.jpg",
    imagePosition: "75% 28%",
  },
  {
    id: "delivery",
    imageSrc: "/images/promos/promo-delivery.jpg",
    imagePosition: "60% 38%",
  },
];

function evalObjectLiteral(source, before, after) {
  const start = source.indexOf(before);
  if (start === -1) {
    throw new Error(`Could not find marker: ${before}`);
  }
  const valueStart = start + before.length;
  const end = source.indexOf(after, valueStart);
  if (end === -1) {
    throw new Error(`Could not find marker: ${after}`);
  }
  const literal = source.slice(valueStart, end).trim();
  return Function(`"use strict"; return (${literal});`)();
}

async function loadSeedContent() {
  const [localeSource, productsSource] = await Promise.all([
    readFile(path.join(rootDir, "src", "i18n", "locale.ts"), "utf8"),
    readFile(path.join(rootDir, "src", "data", "products.ts"), "utf8"),
  ]);
  const locale = localeSource.replace(/\r\n/g, "\n");
  const productsFile = productsSource.replace(/\r\n/g, "\n");

  const productDescriptions = evalObjectLiteral(
    locale,
    "const productDescriptions: Record<Locale, Record<string, string>> = ",
    ";\n\nexport function productDescription"
  );
  const en = evalObjectLiteral(
    locale,
    "const en: Dictionary = ",
    ";\n\nconst pt"
  );
  const pt = evalObjectLiteral(
    locale,
    "const pt: Dictionary = ",
    ";\n\nlet translations"
  );
  const products = evalObjectLiteral(
    productsFile,
    "export let products: readonly Product[] = ",
    ";\n\nexport function getProductById"
  );

  return {
    translations: { "en-US": en, "pt-BR": pt },
    productDescriptions,
    products,
  };
}

const seed = await loadSeedContent();
const pool = new Pool({ connectionString });
const client = await pool.connect();

try {
  await client.query("BEGIN");

  for (const [locale, dictionary] of Object.entries(seed.translations)) {
    for (const [key, value] of Object.entries(dictionary)) {
      await client.query(
        `
          INSERT INTO translations (locale, key, value)
          VALUES ($1, $2, $3)
          ON CONFLICT (locale, key)
          DO UPDATE SET value = EXCLUDED.value, updated_at = now()
        `,
        [locale, key, value]
      );
    }
  }

  for (const [index, product] of seed.products.entries()) {
    await client.query(
      `
        INSERT INTO products (
          id, category, image_src, price_usd, calories_kcal, spicy, sort_order
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id)
        DO UPDATE SET
          category = EXCLUDED.category,
          image_src = EXCLUDED.image_src,
          price_usd = EXCLUDED.price_usd,
          calories_kcal = EXCLUDED.calories_kcal,
          spicy = EXCLUDED.spicy,
          sort_order = EXCLUDED.sort_order,
          updated_at = now()
      `,
      [
        product.id,
        product.category,
        product.imageSrc,
        product.priceUsd,
        product.caloriesKcal,
        product.spicy,
        index,
      ]
    );

    for (const locale of ["en-US", "pt-BR"]) {
      const description =
        seed.productDescriptions[locale]?.[product.id] ?? product.description;
      await client.query(
        `
          INSERT INTO product_translations (
            product_id, locale, name, short_name, description
          )
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (product_id, locale)
          DO UPDATE SET
            name = EXCLUDED.name,
            short_name = EXCLUDED.short_name,
            description = EXCLUDED.description,
            updated_at = now()
        `,
        [product.id, locale, product.name, product.shortName, description]
      );
    }
  }

  for (const [index, promo] of PROMOS.entries()) {
    await client.query(
      `
        INSERT INTO promos (id, image_src, image_position, sort_order)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id)
        DO UPDATE SET
          image_src = EXCLUDED.image_src,
          image_position = EXCLUDED.image_position,
          sort_order = EXCLUDED.sort_order,
          updated_at = now()
      `,
      [promo.id, promo.imageSrc, promo.imagePosition, index]
    );
  }

  await client.query("COMMIT");
  console.log("Database content seed is ready.");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}
