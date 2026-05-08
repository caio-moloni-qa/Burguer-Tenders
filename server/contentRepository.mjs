import pg from "pg";

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://beetee:beetee_dev_password@localhost:5432/beetee_dev";

const pool = new Pool({ connectionString });

export async function loadContent() {
  const client = await pool.connect();
  try {
    const [translationsResult, productsResult, promosResult] =
      await Promise.all([
        client.query(`
          SELECT locale, key, value
          FROM translations
          ORDER BY locale, key
        `),
        client.query(`
          SELECT
            p.id,
            p.category,
            p.image_src,
            p.price_usd,
            p.calories_kcal,
            p.spicy,
            p.sort_order,
            pt.locale,
            pt.name,
            pt.short_name,
            pt.description
          FROM products p
          LEFT JOIN product_translations pt ON pt.product_id = p.id
          ORDER BY p.sort_order, p.id, pt.locale
        `),
        client.query(`
          SELECT id, image_src, image_position
          FROM promos
          ORDER BY sort_order, id
        `),
      ]);

    const translations = {};
    for (const row of translationsResult.rows) {
      translations[row.locale] ??= {};
      translations[row.locale][row.key] = row.value;
    }

    const productsById = new Map();
    for (const row of productsResult.rows) {
      if (!productsById.has(row.id)) {
        productsById.set(row.id, {
          id: row.id,
          name: row.name ?? row.id,
          shortName: row.short_name ?? row.id,
          description: row.description ?? "",
          imageSrc: row.image_src,
          priceUsd: Number(row.price_usd),
          caloriesKcal: Number(row.calories_kcal),
          category: row.category,
          spicy: Boolean(row.spicy),
          translations: {},
        });
      }

      const product = productsById.get(row.id);
      if (row.locale) {
        product.translations[row.locale] = {
          name: row.name,
          shortName: row.short_name,
          description: row.description,
        };

        if (row.locale === "en-US") {
          product.name = row.name;
          product.shortName = row.short_name;
          product.description = row.description;
        }
      }
    }

    return {
      translations,
      products: Array.from(productsById.values()),
      promos: promosResult.rows.map((row) => ({
        id: row.id,
        imageSrc: row.image_src,
        imagePosition: row.image_position,
      })),
    };
  } finally {
    client.release();
  }
}
