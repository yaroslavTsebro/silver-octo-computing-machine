export interface TradeMarketParams {
  /** Asset ID (e.g. USDT = 2) */
  coinId: number;
  /** Fiat currency ID (e.g. UAH = 11) */
  currency: number;
  /** 'buy' to purchase crypto, 'sell' to sell */
  tradeType: 'buy' | 'sell';
  /** Page number, starting at 1 */
  currPage: number;
  /** Items per page (max 20) */
  pageSize: number;
  /** Filter ad type; usually 'general' */
  blockType?: 'general' | 'bonus' | 'locked';
  /** 1 = only online users, 0 = all */
  online?: 0 | 1;
  /** Price‐range filter; 0 = no filter */
  range?: number;
  /** Amount filter; '' = no filter */
  amount?: string;
  /** Payment method ID; 0 = all */
  payMethod?: number;
}

/**
 * Raw response envelope
 */
export interface TradeMarketResponse {
  /** HTTP-style code; 200 = success */
  code: number;
  /** Human-readable message */
  message: string;
  /** Server timestamp (ms since epoch) */
  success: boolean;
  /** Paged data payload */
  data: {
    /** Total number of ads matching your filter */
    ts: number;
    /** This page’s list of ads */
    openApiC2COrderInfoVOList: TradeAd[];
  };
}

/**
 * A single P2P ad
 */
export interface TradeAd {
  orderNo: string
  role: "taker" | "maker"
  counterpartNickName: string
  side: "buy" | "sell"
  fiatCurrency: string
  asset: string
  totalPrice: string
  amount: string
  unitPrice: string
  fee: string
  orderStatus: number
  createTime: string
  queryId: number
}
