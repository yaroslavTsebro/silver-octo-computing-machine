import Database from 'better-sqlite3';
import type { Database as BetterSqlite3Database } from 'better-sqlite3'

const initDb = (): BetterSqlite3Database => {
  const db = new Database('./bybit.db');

  db.exec(`CREATE TABLE IF NOT EXISTS ads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      accountId TEXT,
      userId TEXT,
      adId TEXT,
      tokenId TEXT,
      tokenName TEXT,
      currencyId TEXT,
      side INTEGER,
      priceType INTEGER,
      price TEXT,
      premium TEXT,
      lastQuantity TEXT,
      quantity TEXT,
      frozenQuantity TEXT,
      executedQuantity TEXT,
      minAmount TEXT,
      maxAmount TEXT,
      remark TEXT,
      status INTEGER,
      createDate TEXT,
      payments JSON,
      fee TEXT,
      symbolInfo JSON,
      tradingPreferenceSet JSON,
      version INTEGER,
      itemType TEXT,
      paymentPeriod INTEGER,
      createdAt TEXT
    );`);

  db.exec(`CREATE TABLE IF NOT EXISTS advisors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      accountId TEXT,
      userId TEXT,
      nickName TEXT,
      orderNum INTEGER,
      finishNum INTEGER,
      recentOrderNum INTEGER,
      recentExecuteRate INTEGER,
      isOnline BOOLEAN,
      lastLogoutTime TEXT,
      blocked TEXT,
      makerContact BOOLEAN,
      authStatus INTEGER,
      authTag JSON,
      userType TEXT,
      createdAt TEXT
    );`);

  return db;
}

export const db: BetterSqlite3Database = initDb();