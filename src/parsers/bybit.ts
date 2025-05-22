import { createHmac } from 'node:crypto';
import { getJson } from '../shared/functions/get-json';
import { AdDirection, CryptoTickers, FiatCodes } from '../shared/types';
import { GetAdListResponseWrapped, GetAdListResponseItem, GetAdsRequest, IAdvisor, IAd } from '../shared/types/bybit';
import Database from 'better-sqlite3';
import { mapGetAdListItem } from '../shared/functions/bybit/mapGetAdListItem';
import { db } from 'db/index.js';

export enum Endpoints {
    GET_AD = 'v5/p2p/item/online',
}

export class BybitP2PParser {
    private readonly API_KEY = process.env.BYBIT_KEY!;
    private readonly API_SECRET = process.env.BYBIT_SECRET!;
    private readonly RECV_WINDOW = '5000';
    private readonly BASE_URL = 'https://api.bybit.com/';
    private readonly DELAY = 1000;
    private readonly db = db;

    private signedHeaders(body: object): Record<string, string> {
        const ts = Date.now().toString();
        const json = JSON.stringify(body);
        const pre = ts + this.API_KEY + this.RECV_WINDOW + json;
        const sign = createHmac('sha256', this.API_SECRET).update(pre).digest('hex');

        return {
            'content-type': 'application/json',
            'X-BAPI-API-KEY': this.API_KEY,
            'X-BAPI-TIMESTAMP': ts,
            'X-BAPI-RECV-WINDOW': this.RECV_WINDOW,
            'X-BAPI-SIGN': sign,
        };
    }

    private async delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private getEndpoint(endpoint: Endpoints) {
        return `${this.BASE_URL}${endpoint}`;
    }

    private saveToDb(ads: any[], advisors: any[]) {
        const db = this.db;
        const now = new Date().toISOString();

        const adInsert = db.prepare(`INSERT INTO ads (
      accountId, userId, adId, tokenId, tokenName, currencyId, side, priceType, price, premium,
      lastQuantity, quantity, frozenQuantity, executedQuantity, minAmount, maxAmount,
      remark, status, createDate, payments, fee, symbolInfo, tradingPreferenceSet,
      version, itemType, paymentPeriod, createdAt
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);

        const advisorInsert = db.prepare(`INSERT INTO advisors (
      accountId, userId, nickName, orderNum, finishNum, recentOrderNum,
      recentExecuteRate, isOnline, lastLogoutTime, blocked, makerContact,
      authStatus, authTag, userType, createdAt
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);

        const adTransaction = db.transaction((ads: any[]) => {
            for (const ad of ads) {
                adInsert.run(
                    ad.accountId ?? null,
                    ad.userId ?? null,
                    ad.id ?? null,
                    ad.tokenId ?? null,
                    ad.tokenName ?? null,
                    ad.currencyId ?? null,
                    Number(ad.side) || 0,
                    Number(ad.priceType) || 0,
                    ad.price ?? '0',
                    ad.premium ?? '0',
                    ad.lastQuantity ?? '0',
                    ad.quantity ?? '0',
                    ad.frozenQuantity ?? '0',
                    ad.executedQuantity ?? '0',
                    ad.minAmount ?? '0',
                    ad.maxAmount ?? '0',
                    ad.remark ?? '',
                    Number(ad.status) || 0,
                    ad.createDate ?? null,
                    JSON.stringify(ad.payments ?? []),
                    ad.fee ?? '0',
                    JSON.stringify(ad.symbolInfo ?? {}),
                    JSON.stringify(ad.tradingPreferenceSet ?? {}),
                    Number(ad.version) || 1,
                    ad.itemType ?? '',
                    Number(ad.paymentPeriod) || 0,
                    now
                );

            }
        });

        const advisorTransaction = db.transaction((advisors: any[]) => {
            for (const advisor of advisors) {
                advisorInsert.run(
                    advisor.accountId ?? null,
                    advisor.userId ?? null,
                    advisor.nickName ?? null,
                    Number(advisor.orderNum) || 0,
                    Number(advisor.finishNum) || 0,
                    Number(advisor.recentOrderNum) || 0,
                    Number(advisor.recentExecuteRate) || 0,
                    advisor.isOnline ? 1 : 0,
                    advisor.lastLogoutTime ?? null,
                    advisor.blocked ?? null,
                    advisor.makerContact ? 1 : 0,
                    Number(advisor.authStatus) || 0,
                    JSON.stringify(advisor.authTag ?? []),
                    advisor.userType ?? null,
                    now
                );

            }
        });

        adTransaction(ads);
        advisorTransaction(advisors);
        db.close();
    }

    private async fetchSide(side: AdDirection): Promise<GetAdListResponseItem[]> {
        const all: GetAdListResponseItem[] = [];

        for (let page = 1; page <= 5; page++) {
            const body = {
                tokenId: CryptoTickers.USDT,
                currencyId: FiatCodes.UAH,
                side,
                size: '100',
                page: page.toString(),
            } satisfies GetAdsRequest;

            const res = await getJson<GetAdListResponseWrapped>(this.getEndpoint(Endpoints.GET_AD), {
                method: 'POST',
                headers: this.signedHeaders(body),
                body: JSON.stringify(body),
            });

            console.log(`Page ${page} - ${side === AdDirection.BUY ? 'BUY' : 'SELL'} - ${res.result.items.length}:`, res);

            const items = res.result?.items ?? [];
            all.push(...items);

            if (items.length < 100) break;
            await this.delay(this.DELAY);
        }

        return all;
    }

    async run() {
        const buy = await this.fetchSide(AdDirection.BUY);
        const sell = await this.fetchSide(AdDirection.SELL);
        const allItems = [...buy, ...sell];

        const ads: IAd[] = [];
        const advisors: IAdvisor[] = [];

        for (const item of allItems) {
            const { ad, advisor } = mapGetAdListItem(item);
            ads.push(ad);

            if (!advisors.find(adv => adv.accountId === advisor.accountId && adv.userId === advisor.userId)) {
                advisors.push(advisor);
            }
        }

        this.saveToDb(ads, advisors);
        console.log(`Saved ${ads.length} ads and ${advisors.length} advisors.`);
    }
}



[
    {
        "paymentType": "60",
        "checkType": 1,
        "sort": 0,
        "paymentName": "Privat Bank",
        "addTips": "",
        "itemTips": "",
        "online": 0,
        "items": [
            {
                "view": true,
                "name": "realName",
                "label": "Name",
                "placeholder": "Please Enter Name",
                "type": "text",
                "maxLength": "150",
                "required": true
            },
            {
                "view": true,
                "name": "accountNo",
                "label": "Bank Account Number",
                "placeholder": "Please Enter Account Number",
                "type": "text",
                "maxLength": "100",
                "required": true
            },
            {
                "view": true,
                "name": "branchName",
                "label": "Bank Branch",
                "placeholder": "Please Enter Bank Branch",
                "type": "text",
                "maxLength": "100",
                "required": false
            },
            {
                "view": true,
                "name": "bankName",
                "label": "Bank Name",
                "placeholder": "Please Enter Bank Name",
                "type": "text",
                "maxLength": "100",
                "required": false
            }
        ],
        "paymentAlias": "Privat Bank",
        "paymentExtInfo": {
            "supportCurrencyIds": [],
            "supportAllCurrency": true
        }
    },
    {
        "paymentType": "43",
        "checkType": 1,
        "sort": 0,
        "paymentName": "Monobank",
        "paymentAlias": "Monobank",
        "paymentExtInfo": {
            "supportCurrencyIds": [],
            "supportAllCurrency": true
        }
    },
    {
        "paymentType": "1",
        "checkType": 1,
        "sort": 0,
        "paymentName": "A-Bank",
        "paymentAlias": "A-Bank",
        "paymentExtInfo": {
            "supportCurrencyIds": [],
            "supportAllCurrency": true
        }
    },
    {
        "paymentType": "61",
        "checkType": 1,
        "sort": 0,
        "paymentName": "PUMB",
        "paymentAlias": "PUMB",
        "paymentExtInfo": {
            "supportCurrencyIds": [],
            "supportAllCurrency": true
        }
    },
    {
        "paymentType": "46",
        "checkType": 1,
        "sort": 0,
        "paymentName": "Oschadbank",
        "paymentAlias": "Oschadbank",
        "paymentExtInfo": {
            "supportCurrencyIds": [],
            "supportAllCurrency": true
        }
    },
    {
        "paymentType": "544",
        "checkType": 1,
        "sort": 0,
        "paymentName": "Izibank",
        "paymentAlias": "Izibank",
        "paymentExtInfo": {
            "supportCurrencyIds": [],
            "supportAllCurrency": true
        }
    },
    {
        "paymentType": "90",
        "checkType": 4,
        "sort": 0,
        "paymentName": "Cash in Person",
        "addTips": "This payment method requires a face-to-face transaction offline. Choose other bank transfer payment methods to trade instantly.",
        "itemTips": "This payment method requires a face-to-face transaction offline. Choose other bank transfer payment methods to trade instantly.",
        "paymentAlias": "Cash in Person",
        "paymentExtInfo": {
            "supportCurrencyIds": [],
            "supportAllCurrency": true
        }
    },
    {
        "paymentType": "96",
        "checkType": 4,
        "sort": 0,
        "paymentName": "Cash app",
        "paymentAlias": "Cash app",
        "paymentExtInfo": {
            "supportCurrencyIds": [],
            "supportAllCurrency": true
        }
    },
    {
        "paymentType": "545",
        "checkType": 1,
        "sort": 0,
        "paymentName": "Bank Vlasnyi Rakhunok",
        "paymentAlias": "Bank Vlasnyi Rakhunok",
        "paymentExtInfo": {
            "supportCurrencyIds": [],
            "supportAllCurrency": true
        }
    },
    {
        "paymentType": "64",
        "checkType": 1,
        "sort": 0,
        "paymentName": "Raiffeisenbank",
        "paymentAlias": "Raiffeisenbank",
        "paymentExtInfo": {
            "supportCurrencyIds": [],
            "supportAllCurrency": true
        }
    },
    {
        "paymentType": "63",
        "checkType": 1,
        "sort": 0,
        "paymentName": "Raiffeisen Bank Aval",
        "paymentAlias": "Raiffeisen Bank Aval",
        "paymentExtInfo": {
            "supportCurrencyIds": [],
            "supportAllCurrency": true
        }
    },
    {
        "paymentType": "80",
        "checkType": 1,
        "sort": 0,
        "paymentName": "Ukrsibbank",
        "paymentAlias": "Ukrsibbank",
        "paymentExtInfo": {
            "supportCurrencyIds": [],
            "supportAllCurrency": true
        }
    },
    {
        "paymentType": "45",
        "checkType": 3,
        "sort": 0,
        "paymentName": "NEO",
        "paymentAlias": "NEO",
        "paymentExtInfo": {
            "supportCurrencyIds": [],
            "supportAllCurrency": true
        }
    },
    {
        "paymentType": "49",
        "checkType": 1,
        "sort": 0,
        "paymentName": "OTP Bank",
        "paymentAlias": "OTP Bank",
        "paymentExtInfo": {
            "supportCurrencyIds": [],
            "supportAllCurrency": true
        }
    },
    {
        "paymentType": "31",
        "checkType": 1,
        "sort": 0,
        "paymentName": "Idea Bank",
        "paymentAlias": "Idea Bank",
        "paymentExtInfo": {
            "supportCurrencyIds": [],
            "supportAllCurrency": true
        }
    },
    {
        "paymentType": "74",
        "checkType": 1,
        "sort": 0,
        "paymentName": "Tascombank",
        "paymentAlias": "Tascombank",
        "paymentExtInfo": {
            "supportCurrencyIds": [],
            "supportAllCurrency": true
        }
    },
    {
        "paymentType": "624",
        "checkType": 3,
        "sort": 0,
        "paymentName": "Unex Bank",
        "paymentAlias": "Unex Bank",
        "paymentExtInfo": {
            "supportCurrencyIds": [],
            "supportAllCurrency": true
        }
    },
    {
        "paymentType": "625",
        "checkType": 3,
        "sort": 0,
        "paymentName": "Credit Dnipro",
        "paymentAlias": "Credit Dnipro",
        "paymentExtInfo": {
            "supportCurrencyIds": [],
            "supportAllCurrency": true
        }
    },
    {
        "paymentType": "623",
        "checkType": 3,
        "paymentName": "Sense SuperApp",
        "paymentAlias": "Sense SuperApp",
        "paymentExtInfo": {
            "supportCurrencyIds": [],
            "supportAllCurrency": true
        }
    },
    {
        "paymentType": "546",
        "checkType": 1,
        "sort": 0,
        "paymentName": "Forward Bank",
        "paymentAlias": "Forward Bank",
        "paymentExtInfo": {
            "supportCurrencyIds": [],
            "supportAllCurrency": true
        }
    },
    {
        "paymentType": "78",
        "checkType": 4,
        "sort": 0,
        "paymentName": "Wise",
        "addTips": "This payment method may be delayed, choose other bank transfer payment methods to trade instantly.",
        "itemTips": "This payment method may be delayed, choose other bank transfer payment methods to trade instantly.",
        "paymentAlias": "Wise",
        "paymentExtInfo": {
            "supportCurrencyIds": [],
            "supportAllCurrency": true
        }
    },
    {
        "paymentType": "547",
        "checkType": 1,
        "paymentName": "Pravex Bank",
        "paymentAlias": "Pravex Bank",
        "paymentExtInfo": {
            "supportCurrencyIds": [],
            "supportAllCurrency": true
        }
    },
    {
        "paymentType": "40",
        "checkType": 3,
        "paymentName": "Mobile Top-up",
        "paymentAlias": "Mobile Top-up",
        "paymentExtInfo": {
            "supportCurrencyIds": [],
            "supportAllCurrency": true
        }
    },
    {
        "paymentType": "5",
        "checkType": 3,
        "sort": 0,
        "paymentName": "Volet.com (Formerly Advcash)",
        "paymentAlias": "Volet.com (Formerly Advcash)",
        "paymentExtInfo": {
            "supportCurrencyIds": [],
            "supportAllCurrency": true
        }
    },
    {
        "paymentType": "22",
        "checkType": 1,
        "sort": 0,
        "paymentName": "Credit Agricole",
        "paymentAlias": "Credit Agricole",
        "paymentExtInfo": {
            "supportCurrencyIds": [],
            "supportAllCurrency": true
        }
    },
    {
        "paymentType": "342",
        "checkType": 4,
        "sort": 0,
        "paymentName": "GEO Pay",
        "paymentAlias": "GEO Pay",
        "paymentExtInfo": {
            "supportCurrencyIds": [],
            "supportAllCurrency": true
        }
    },
    {
        "paymentType": "34",
        "checkType": 1,
        "sort": 0,
        "paymentName": "KredoBank",
        "paymentAlias": "KredoBank",
        "paymentExtInfo": {
            "supportCurrencyIds": [],
            "supportAllCurrency": true
        }
    },
    {
        "paymentType": "548",
        "checkType": 1,
        "sort": 0,
        "paymentName": "Ukrgasbank",
        "paymentAlias": "Ukrgasbank",
        "paymentExtInfo": {
            "supportCurrencyIds": [],
            "supportAllCurrency": true
        }
    },
    {
        "paymentType": "526",
        "checkType": 1,
        "sort": 0,
        "paymentName": "Ecobank",
        "paymentAlias": "Ecobank",
        "paymentExtInfo": {
            "supportCurrencyIds": [],
            "supportAllCurrency": true
        }
    },
    {
        "paymentType": "13",
        "checkType": 1,
        "sort": 0,
        "paymentName": "Bank Pivdenny",
        "paymentAlias": "Bank Pivdenny",
        "paymentExtInfo": {
            "supportCurrencyIds": [],
            "supportAllCurrency": true
        }
    },
]