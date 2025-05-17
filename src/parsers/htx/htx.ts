import { TradeAd, TradeMarketParams, TradeMarketResponse } from 'shared/types/htx';
import { getJson } from '../../shared/functions/get-json';
import { PrivateUrlBuilder } from './auth';

export enum HtxEndpoints {
  TRADE_MARKET = '/v1/api/c2c/order/history',
}

export class HtxP2PParser {
  private readonly BASE_URL = 'api.huobi.pro';

  async run() {
    const params = {
      side: '0',
    };

    const req = new PrivateUrlBuilder(
      '',
      '',
      this.BASE_URL,
      '256',
    )

    const res = req.build('GET', HtxEndpoints.TRADE_MARKET, params)

    const data = await getJson<any>(res)

    console.dir(data, { depth: 10 });
  }
}
