import { RestClientV2 } from 'bitget-api';
import crypto from 'crypto';
import { getJson } from '../../shared/functions/get-json';

function generate(timestamp: string, method: string, requestPath: string, queryString: string, body: object, secretKey: string) {
  method = method.toUpperCase();
  body = body || '';
  queryString = queryString ? '?' + queryString : '';

  const preHash = timestamp + method + requestPath + queryString;
  console.log('preHash:', preHash);

  return crypto
    .createHmac('sha256', secretKey)
    .update(preHash, 'utf8')
    .digest('base64');
}

function getHeaders({ timestamp, method, path, queryString, body }: { timestamp: string; method: string; path: string; queryString: string; body: object }) {
  const signature = generate(timestamp, method, path, queryString, body, '');

  const headers = {
    'ACCESS-KEY': '',
    'ACCESS-SIGN': signature,
    'ACCESS-TIMESTAMP': timestamp,
    'ACCESS-PASSPHRASE': '',
    'Content-Type': 'application/json',
  };

  return headers;
}

export class BitGetP2PParser {
  async run() {

    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    const timestamp = now.toString();
    const queryString = `limit=10&offset=0&coin=USDT&fiat=UAH&side=buy`

    const path = '/api/v2/p2p/advList';
    const url = `https://api.bitget.com${path}?${queryString}`;

    const signGet = getHeaders({
      timestamp: timestamp,
      method: 'GET',
      path: path,
      queryString: queryString,
      body: {}, // GET — тело пустое
    });

    const res = await fetch(url, {
      method: 'GET',
      headers: { 'content-type': 'application/json', ...signGet },
    });

    const json = await res.json()

    console.dir(json, { depth: 10 });
  }
}