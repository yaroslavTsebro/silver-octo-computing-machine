import { Database } from 'better-sqlite3';

type AggregationParams = {
  fromTimestamp?: number;
  toTimestamp?: number;
};

export function aggregateToPriceChartByTimestamp(
  { fromTimestamp, toTimestamp }: AggregationParams,
  db: Database
) {
  const whereClauses = ['lastQuantity > 0', 'price IS NOT NULL'];
  const params: any[] = [];

  if (fromTimestamp !== undefined) {
    whereClauses.push('createdAt >= ?');
    params.push(fromTimestamp);
  }

  if (toTimestamp !== undefined) {
    whereClauses.push('createdAt <= ?');
    params.push(toTimestamp);
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const sql = `
    SELECT
      side,
      createdAt,
      JSON_GROUP_ARRAY(
        JSON_OBJECT(
          'id', adId,
          'paymentType', payments,
          'volume', price * lastQuantity,
          'price', price
        )
      ) AS ads_json,
      SUM(price * lastQuantity) / NULLIF(SUM(lastQuantity), 0) AS weighted_avg_price,
      SUM(price * lastQuantity) AS volume,
      COUNT(*) AS orders_count
    FROM ads
    ${whereSql}
    GROUP BY side, createdAt
  `;

  const rows: any[] = db.prepare(sql).all(...params);

  const insert = db.prepare(`
    INSERT OR REPLACE INTO ads_price_chart (
      side,
      ads_json,
      weighted_avg_price,
      volume,
      orders_count,
      createdAt
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    for (const row of rows) {

      insert.run(
        row.side,
        row.ads_json,
        row.weighted_avg_price,
        row.volume,
        row.orders_count,
        row.createdAt
      );
    }
  });

  tx();
  console.log(`✅ Aggregated ${rows.length} rows into ads_price_chart`);
}
