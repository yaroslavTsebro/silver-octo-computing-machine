import Database from 'better-sqlite3';
import { runMigrations } from 'migrations/index.js';
import { aggregateToPriceChartByTimestamp } from './е/aggregateToPriceChart';

export class Transformer {
  async run() {
    const db = this.initDb()

    aggregateToPriceChartByTimestamp({}, db)
  }

  private initDb() {
    const db = new Database('./bybit.db')
    runMigrations(db)
    return db
  }
}
