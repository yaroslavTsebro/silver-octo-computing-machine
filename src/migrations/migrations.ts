export const migrations: { name: string; up: string }[] = [
  {
    name: '001-create-paymentTypes-and-adPayment',
    up: `
      CREATE TABLE IF NOT EXISTS paymentTypes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS adPayment (
        adId TEXT NOT NULL,
        paymentTypeId INTEGER NOT NULL,
        FOREIGN KEY (paymentTypeId) REFERENCES paymentTypes(id),
        FOREIGN KEY (adId) REFERENCES ads(adId)
      );

      CREATE INDEX IF NOT EXISTS idx_adPayment_paymentTypeId ON adPayment(paymentTypeId);
      CREATE INDEX IF NOT EXISTS idx_adPayment_adId ON adPayment(adId);
    `,
  },
  {
    name: '002-create-basic-indexes',
    up: `
      CREATE INDEX IF NOT EXISTS idx_advisors_accountId ON advisors(accountId);
      CREATE INDEX IF NOT EXISTS idx_advisors_userId ON advisors(userId);
      CREATE INDEX IF NOT EXISTS idx_ads_id ON ads(id);
    `,
  },

  {
    name: '003-create-ads_price_chart',
    up: `
    CREATE TABLE IF NOT EXISTS ads_price_chart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      side INTEGER NOT NULL,
      ads_json TEXT NOT NULL,            -- массив объявлений с id, paymentType, volume, price
      weighted_avg_price REAL NOT NULL,  -- средневзвешенная цена
      volume REAL NOT NULL,              -- общий объём
      orders_count INTEGER NOT NULL,     -- кол-во ордеров
      createdAt TEXT NOT NULL            -- оригинальный createdAt
    );

    CREATE INDEX IF NOT EXISTS idx_ads_price_chart_createdAt ON ads_price_chart(createdAt);
    CREATE INDEX IF NOT EXISTS idx_ads_price_chart_side ON ads_price_chart(side);
  `
  }

];
