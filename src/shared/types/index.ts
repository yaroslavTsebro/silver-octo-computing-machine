export enum P2PExchanges {
  BYBIT = 'BYBIT',
  HTX = 'HTX',
}

export enum AdDirection {
  BUY = '0',
  SELL = '1',
}

export enum CryptoTickers {
  USDT = 'USDT',
  USDC = 'USDC',
}

export enum FiatCodes {
  UAH = 'UAH',
}

export interface Pagination {
  page?: string;
  size?: string;
}