import { AdDirection, CryptoTickers, FiatCodes, Pagination } from '..';

export interface GetAdsRequest extends Pagination {
  tokenId: CryptoTickers;
  currencyId: FiatCodes;
  side: AdDirection;
}

export interface GetAdListResponseWrapped {
  ret_code: number;
  ret_msg: string;
  result: GetAdListResponse;
  ext_code: string;
  ext_info: object;
  time_now: string;
}

export interface GetAdListResponse {
  count: number;
  items: GetAdListResponseItem[];
}

export enum PriceEnum {
  FIXED = 0,
  FLOATING = 1,
}

export enum YesNo {
  YES = 'Y',
  NO = 'N',
}

export enum UserType {
  PERSONAL = 'PERSONAL'
}

export enum ItemType {
  ORIGIN = 'ORIGIN'
}

export interface GetAdListResponseItem {
  id: string; // Уникальный идентификатор объявления
  accountId: string; // Идентификатор аккаунта пользователя (создателя объявления)
  userId: string; // Идентификатор пользователя, создавшего объявление
  nickName: string; // Никнейм (псевдоним) создателя объявления
  tokenId: string; // ID токена (криптовалюты), например "USDT"
  tokenName: string; // Название токена (чаще всего совпадает с его тикером)
  currencyId: string; // ID фиатной валюты, например "USD" или "EUR"
  side: number; // Сторона сделки: 0 — покупка токена; 1 — продажа токена
  priceType: number; // Тип цены объявления: 0 — фиксированный курс; 1 — плавающий курс
  price: string; // Цена за единицу токена в выбранной фиатной валюте
  premium: string; // Наценка/скидка к рыночному курсу (для плавающего типа цены)
  lastQuantity: string; // Оставшееся количество токена, доступное для торговли
  quantity: string; // Изначально объявленное количество токена в объявлении
  frozenQuantity: string; // Количество токена, зарезервированное в текущих сделках
  executedQuantity: string; // Количество токена, уже реализованное по этому объявлению
  minAmount: string; // Минимальная сумма сделки в фиатной валюте
  maxAmount: string; // Максимальная сумма сделки в фиатной валюте
  remark: string; // Примечание или описание объявления (видно другим пользователям)
  status: number; // Статус объявления: 10 — активно (онлайн); 20 — неактивно (офлайн); 30 — завершено
  createDate: string; // Время создания объявления (Unix-время в миллисекундах)
  payments: string[]; // Список ID доступных методов оплаты для сделки
  orderNum: number; // Общее число сделок, совершённых пользователем (всего)
  finishNum: number; // Общее число успешно завершённых сделок пользователя
  recentOrderNum: number; // Количество сделок пользователя за недавний период (например, последние 30 дней)
  recentExecuteRate: number; // Процент успешно выполненных сделок за тот же период (например, 95 означает 95%)
  fee: string; // Ставка комиссии платформы для сделки (может быть пустой, если комиссия не взимается)
  isOnline: boolean; // Онлайн-статус пользователя (true, если пользователь в сети)
  lastLogoutTime: string; // Время последнего выхода пользователя (Unix-время, когда был офлайн)
  blocked: string; // Флаг блокировки/скрытия объявления или пользователя ('Y' если заблокирован, 'N' если нет)
  makerContact: boolean; // Возможность прямого контакта с создателем объявления (true/false)
  symbolInfo: SymbolInfo; // Объект с информацией о торговой паре (токен и фиатная валюта)
  tradingPreferenceSet: TradingPreferenceSet; // Условия/требования к потенциальному контрагенту
  version: number; // Версия объявления (1 или 2 — внутренний параметр формата объявления)
  authStatus: number; // Статус авторизации/верификации пользователя (например, 1 — верифицирован)
  recommend: boolean; // Признак рекомендуемого объявления (true, если объявление помечено как рекомендуемое)
  recommendTag: string; // Тег рекомендации объявления (строка с отметкой, если объявление рекомендовано, иначе пусто)
  authTag: BybitP2PAuthTag[]; // Массив меток статуса пользователя (например, ["BA"], ["VA"], ["CA"])
  userType: string; // Тип пользователя: "ORG" для корпоративного аккаунта, "PERSONAL" для обычного пользователя
  itemType: string; // Тип объявления: "ORIGIN" — обычное объявление; "BULK" — крупная (оптовая) сделка
  paymentPeriod: number; // Время, отведённое на оплату по сделке (в минутах)
}

interface SymbolInfo {
  id: string; // Внутренний идентификатор торгового символа (пары токен-фиат)
  exchangeId: string; // Идентификатор платформы/биржи (в контексте P2P)
  orgId: string; // Внутренний идентификатор организации
  tokenId: string; // ID токена (криптовалюты) для этой пары
  currencyId: string; // ID фиатной валюты для этой пары
  status: number; // Статус символа (например, 1 — активен)
  lowerLimitAlarm: number; // Нижний порог курса для сигнала тревоги (например, 90 означает 0.90 в фиатной валюте)
  upperLimitAlarm: number; // Верхний порог курса для сигнала тревоги (например, 110 означает 1.10)
  itemDownRange: string; // Минимально допустимый предел цены (% от базового курса, например "70" = 70%)
  itemUpRange: string; // Максимально допустимый предел цены (% от базового курса, например "130" = 130%)
  currencyMinQuote: string; // Минимально допустимая сумма сделки в данной фиатной валюте
  currencyMaxQuote: string; // Максимально допустимая сумма сделки в данной фиатной валюте
  currencyLowerMaxQuote: string; // Ограничение на сумму сделки для неквалифицированных пользователей (без полной верификации)
  tokenMinQuote: string; // Минимально допустимое количество токена для сделки
  tokenMaxQuote: string; // Максимально допустимое количество токена для сделки
  kycCurrencyLimit: string; // Порог суммы, при превышении которой требуется KYC (верификация), в фиатной валюте
  itemSideLimit: number; // Ограничение по сторонам сделки для этой пары (1 — только покупка, 2 — только продажа, 3 — обе стороны)
  buyFeeRate: string; // Комиссия (ставка) для ордеров на покупку по данной паре (например, "0" если нет комиссии)
  sellFeeRate: string; // Комиссия (ставка) для ордеров на продажу по данной паре
  orderAutoCancelMinute: number; // Время автоотмены ордера, если покупатель не оплатил вовремя (в минутах)
  orderFinishMinute: number; // Время на завершение сделки после отметки об оплате (в минутах)
  tradeSide: number; // Код торгового направления для пары (внутренний параметр)
  currency: IFiat; // Объект с деталями фиатной валюты (ID, код, точность и др.)
  token: IToken; // Объект с деталями токена (ID, код, точность и др.)
  buyAd: { paymentPeriods: number[] } | null; // Доступные интервалы оплаты (в минутах) для объявлений на покупку, или null если не применимо
  sellAd: { paymentPeriods: number[] } | null; // Доступные интервалы оплаты для объявлений на продажу, или null
}

interface TradingPreferenceSet {
  hasUnPostAd: number; // Требование: контрагент не должен иметь собственных объявлений (0 — не нужно; 1 — требуется)
  isKyc: number; // Требование: контрагент прошёл KYC (идентификацию) (0 — не обязательно; 1 — обязательно)
  isEmail: number; // Требование: у контрагента привязан email (0 — не обязательно; 1 — обязательно)
  isMobile: number; // Требование: у контрагента привязан номер телефона (0 — не обязательно; 1 — обязательно)
  hasRegisterTime: number; // Требование: минимальный срок регистрации аккаунта (0 — не нужен; 1 — необходим определённый срок)
  registerTimeThreshold: number; // Порог давности регистрации в днях (если требуется минимальный срок регистрации)
  orderFinishNumberDay30: number; // Минимальное количество завершённых ордеров за последние 30 дней (требуемое)
  completeRateDay30: string; // Минимальный процент выполнения ордеров за последние 30 дней (требуемый), в процентах
  nationalLimit: string; // Ограничение по стране для контрагента (необходимые/запрещённые страны по ISO-коду, если применимо)
  hasOrderFinishNumberDay30: number; // Флаг требования по количеству завершённых сделок за 30 дней (0 — нет; 1 — да)
  hasCompleteRateDay30: number; // Флаг требования по проценту успешных сделок за 30 дней (0 — нет; 1 — да)
  hasNationalLimit: number; // Флаг требования по ограничению страны (0 — нет; 1 — да)
}

interface IFiat {
  id: string; // Внутренний идентификатор фиатной валюты
  exchangeId: string; // Идентификатор платформы (обычно 0 для P2P)
  orgId: string; // Внутренний идентификатор организации
  currencyId: string; // Код фиатной валюты (например, "USD", "EUR")
  scale: number; // Число десятичных знаков, допустимых для данной валюты
}

interface IToken {
  id: string; // Внутренний идентификатор токена (криптовалюты)
  exchangeId: string; // Идентификатор платформы (в контексте P2P, обычно 0)
  orgId: string; // Внутренний идентификатор организации
  tokenId: string; // Код токена (например, "USDT", "BTC")
  scale: number; // Число десятичных знаков, используемых для данного токена
  sequence: number; // Порядковый номер токена (внутренний параметр сортировки/идентификатор)
}

enum BybitP2PAuthTag {
  BA = 'BA', // Basic Account — базовый аккаунт пользователя (минимальная либо отсутствующая верификация)
  VA = 'VA', // Verified Account — верифицированный аккаунт (пользователь прошёл полную идентификацию KYC)
  CA = 'CA', // Corporate Account — корпоративный аккаунт (мерчант или бизнес-пользователь)
}

export interface IAdvisor {
  accountId: string; // Идентификатор аккаунта пользователя (создателя объявления)
  userId: string; // Идентификатор пользователя, создавшего объявление
  nickName: string; // Никнейм (псевдоним) создателя объявления
  orderNum: number; // Общее число сделок, совершённых пользователем (всего)
  finishNum: number; // Общее число успешно завершённых сделок пользователя
  recentOrderNum: number; // Количество сделок пользователя за недавний период (например, последние 30 дней)
  recentExecuteRate: number; // Процент успешно выполненных сделок за тот же период (например, 95 означает 95%)
  isOnline: boolean; // Онлайн-статус пользователя (true, если пользователь в сети)
  lastLogoutTime: string; // Время последнего выхода пользователя (Unix-время, когда был офлайн)
  blocked: string; // Флаг блокировки/скрытия объявления или пользователя ('Y' если заблокирован, 'N' если нет)
  makerContact: boolean; // Возможность прямого контакта с создателем объявления (true/false)
  authStatus: number; // Статус авторизации/верификации пользователя (например, 1 — верифицирован)
  authTag: BybitP2PAuthTag[]; // Массив меток статуса пользователя (например, ["BA"], ["VA"], ["CA"])
  userType: string; // Тип пользователя: "ORG" для корпоративного аккаунта, "PERSONAL" для обычного пользователя
}

export interface IAd {
  accountId: string; // Идентификатор аккаунта пользователя (создателя объявления)
  userId: string; // Идентификатор пользователя, создавшего объявление
  id: string; // Уникальный идентификатор объявления
  tokenId: string; // ID токена (криптовалюты), например "USDT"
  tokenName: string; // Название токена (чаще всего совпадает с его тикером)
  currencyId: string; // ID фиатной валюты, например "USD" или "EUR"
  side: number; // Сторона сделки: 0 — покупка токена; 1 — продажа токена
  priceType: number; // Тип цены объявления: 0 — фиксированный курс; 1 — плавающий курс
  price: string; // Цена за единицу токена в выбранной фиатной валюте
  premium: string; // Наценка/скидка к рыночному курсу (для плавающего типа цены)
  lastQuantity: string; // Оставшееся количество токена, доступное для торговли
  quantity: string; // Изначально объявленное количество токена в объявлении
  frozenQuantity: string; // Количество токена, зарезервированное в текущих сделках
  executedQuantity: string; // Количество токена, уже реализованное по этому объявлению
  minAmount: string; // Минимальная сумма сделки в фиатной валюте
  maxAmount: string; // Максимальная сумма сделки в фиатной валюте
  remark: string; // Примечание или описание объявления (видно другим пользователям)
  status: number; // Статус объявления: 10 — активно (онлайн); 20 — неактивно (офлайн); 30 — завершено
  createDate: string; // Время создания объявления (Unix-время в миллисекундах)
  payments: string[]; // Список ID доступных методов оплаты для сделки
  fee: string; // Ставка комиссии платформы для сделки (может быть пустой, если комиссия не взимается)
  symbolInfo: SymbolInfo; // Объект с информацией о торговой паре (токен и фиатная валюта)
  tradingPreferenceSet: TradingPreferenceSet; // Условия/требования к потенциальному контрагенту
  version: number; // Версия объявления (1 или 2 — внутренний параметр формата объявления)
  itemType: string; // Тип объявления: "ORIGIN" — обычное объявление; "BULK" — крупная (оптовая) сделка
  paymentPeriod: number; // Время, отведённое на оплату по сделке (в минутах)
}