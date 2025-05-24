import Database from 'better-sqlite3';
import { runMigrations } from 'migrations/index.js';

export class Transformer {
  async run() {
    const db = this.initDb();
    this.createAggTables(db);
    this.aggregateAds(db);
    console.log('Aggregation complete.');
  }

  private initDb() {
    const db = new Database('./bybit.db');
    runMigrations(db);
    return db;
  }

  private createAggTables(db: Database.Database) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS ads_agg_exact (
        ts_bucket TEXT,
        tokenId TEXT,
        currencyId TEXT,
        side INTEGER,
        payment_ids TEXT,
        amount_range TEXT,
        price_avg REAL,
        volume_total REAL,
        ad_count INTEGER,
        PRIMARY KEY (ts_bucket, tokenId, currencyId, side, payment_ids, amount_range)
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS ads_agg_by_payment (
        ts_bucket TEXT,
        tokenId TEXT,
        currencyId TEXT,
        side INTEGER,
        payment_id TEXT,
        amount_range TEXT,
        price_avg REAL,
        volume_total REAL,
        ad_count INTEGER,
        PRIMARY KEY (ts_bucket, tokenId, currencyId, side, payment_id, amount_range)
      );
    `);
  }

  private getAmountRange(minAmount: string): string {
    const min = parseFloat(minAmount);
    if (min < 100) return '<100';
    if (min < 1000) return '100-1000';
    if (min < 5000) return '1000-5000';
    if (min < 20000) return '5000-20000';
    return '20000+';
  }

  private normalizePayments(payments: string[]): string {
    return payments.sort().join(',');
  }

  private aggregateAds(db: Database.Database) {
    const createdGroups: any[] = db.prepare(`SELECT DISTINCT createdAt FROM ads ORDER BY createdAt ASC`).all();

    const insertExact = db.prepare(`REPLACE INTO ads_agg_exact (ts_bucket, tokenId, currencyId, side, payment_ids, amount_range, price_avg, volume_total, ad_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const insertPay = db.prepare(`REPLACE INTO ads_agg_by_payment (ts_bucket, tokenId, currencyId, side, payment_id, amount_range, price_avg, volume_total, ad_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    for (const group of createdGroups) {
      const ads: any[] = db.prepare(`SELECT * FROM ads WHERE createdAt = ?`).all(group.createdAt);

      const aggExact = new Map();
      const aggByPayment = new Map();

      for (const ad of ads) {
        const tsBucket = ad.createdAt
        const baseKey = `${tsBucket}_${ad.tokenId}_${ad.currencyId}_${ad.side}`;
        const amountRange = this.getAmountRange(ad.minAmount);
        const payments = JSON.parse(ad.payments);
        const normPayments = this.normalizePayments(payments);
        const exactKey = `${baseKey}_${normPayments}_${amountRange}`;

        const qty = parseFloat(ad.lastQuantity);
        const price = parseFloat(ad.price);

        if (!aggExact.has(exactKey)) {
          aggExact.set(exactKey, { sum: 0, qty: 0, count: 0 });
        }
        const e = aggExact.get(exactKey);
        e.sum += price * qty;
        e.qty += qty;
        e.count++;

        for (const pid of payments) {
          const payKey = `${baseKey}_${pid}_${amountRange}`;
          if (!aggByPayment.has(payKey)) {
            aggByPayment.set(payKey, { sum: 0, qty: 0, count: 0 });
          }
          const p = aggByPayment.get(payKey);
          p.sum += price * qty;
          p.qty += qty;
          p.count++;
        }
      }

      for (const [key, val] of aggExact.entries()) {
        const [ts, tokenId, currencyId, side, payment_ids, amountRange] = key.split('_');
        insertExact.run(ts, tokenId, currencyId, +side, payment_ids, amountRange, val.sum / val.qty, val.qty, val.count);
      }

      for (const [key, val] of aggByPayment.entries()) {
        const [ts, tokenId, currencyId, side, payment_id, amountRange] = key.split('_');
        insertPay.run(ts, tokenId, currencyId, +side, payment_id, amountRange, val.sum / val.qty, val.qty, val.count);
      }
    }
  }
}
