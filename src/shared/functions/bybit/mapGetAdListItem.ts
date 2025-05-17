import { GetAdListResponseItem, IAdvisor, IAd } from '../../types/bybit/index'

export function mapGetAdListItem(item: GetAdListResponseItem): { advisor: IAdvisor; ad: IAd } {
  const advisor: IAdvisor = {
    accountId: item.accountId,
    userId: item.userId,
    nickName: item.nickName,
    orderNum: item.orderNum,
    finishNum: item.finishNum,
    recentOrderNum: item.recentOrderNum,
    recentExecuteRate: item.recentExecuteRate,
    isOnline: item.isOnline,
    lastLogoutTime: item.lastLogoutTime,
    blocked: item.blocked,
    makerContact: item.makerContact,
    authStatus: item.authStatus,
    authTag: item.authTag,
    userType: item.userType,
  }

  const ad: IAd = {
    accountId: item.accountId,
    userId: item.userId,
    id: item.id,
    tokenId: item.tokenId,
    tokenName: item.tokenName,
    currencyId: item.currencyId,
    side: item.side,
    priceType: item.priceType,
    price: item.price,
    premium: item.premium,
    lastQuantity: item.lastQuantity,
    quantity: item.quantity,
    frozenQuantity: item.frozenQuantity,
    executedQuantity: item.executedQuantity,
    minAmount: item.minAmount,
    maxAmount: item.maxAmount,
    remark: item.remark,
    status: item.status,
    createDate: item.createDate,
    payments: item.payments,
    fee: item.fee,
    symbolInfo: item.symbolInfo,
    tradingPreferenceSet: item.tradingPreferenceSet,
    version: item.version,
    itemType: item.itemType,
    paymentPeriod: item.paymentPeriod,
  }

  return { advisor, ad }
}