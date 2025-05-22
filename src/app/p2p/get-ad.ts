import { db } from 'db/index.js'
import { FastifyRequest, FastifyReply } from 'fastify'

type GetAvgPriceChartParams = {
  stepInMinutes: string
  from: string
  to: string
  adId?: string
  paymentType?: string
  paymentTypeOnly?: string
}

type AdPreview = {
  accountId: string
  id: string
  price: string
  lastQuantity: string
  quantity: string
  frozenQuantity: string
}

type PriceChartPoint = {
  side: number
  time_slot: string
  weighted_avg_price: number
  orders_count: number
  ads: AdPreview[]
}

export async function getAd(
  request: FastifyRequest<{ Params: GetAvgPriceChartParams }>,
  reply: FastifyReply
) {
  const { stepInMinutes, from, to, adId, paymentType, paymentTypeOnly } = request.params

  const step = parseInt(stepInMinutes, 10)
  if (isNaN(step) || step <= 0) {
    return reply.code(400).send({ error: 'Invalid stepInMinutes' })
  }

  const data = getAveragePriceChartInternal({
    stepInMinutes: step,
    from,
    to,
    adId: adId || null,
    paymentType: paymentType || null,
    paymentTypeOnly: paymentTypeOnly || null,
  })

  return reply.send(data)
}

function getAveragePriceChartInternal(params: {
  stepInMinutes: number
  from: string
  to: string
  adId?: string | null
  paymentType?: string | null
  paymentTypeOnly?: string | null
}): PriceChartPoint[] {
  const { stepInMinutes, from, to, adId, paymentType, paymentTypeOnly } = params

  let baseSql = `
    SELECT
      side,
      DATETIME(
        STRFTIME('%s', createdAt) / (${stepInMinutes} * 60) * (${stepInMinutes} * 60),
        'unixepoch'
      ) AS time_slot,
      SUM(CAST(price AS REAL) * CAST(lastQuantity AS REAL)) / NULLIF(SUM(CAST(lastQuantity AS REAL)), 0) AS weighted_avg_price,
      COUNT(*) AS orders_count,
      JSON_GROUP_ARRAY(
        JSON_OBJECT(
          'accountId', accountId,
          'id', adId,
          'price', price,
          'lastQuantity', lastQuantity,
          'quantity', quantity,
          'frozenQuantity', frozenQuantity
        )
      ) AS ads_json
    FROM ads
    WHERE createdAt BETWEEN ? AND ?
      AND price IS NOT NULL
      AND lastQuantity IS NOT NULL
      AND CAST(lastQuantity AS REAL) > 0
  `

  const paramsArray: any[] = [from, to]

  if (adId) {
    baseSql += ` AND adId = ?`
    paramsArray.push(adId)
  }

  if (paymentType) {
    baseSql += `
      AND EXISTS (
        SELECT 1 FROM json_each(ads.payments)
        WHERE value = ?
      )
    `
    paramsArray.push(paymentType)
  }

  if (paymentTypeOnly) {
    baseSql += `
      AND NOT EXISTS (
        SELECT 1 FROM json_each(ads.payments)
        WHERE value != ?
      )
    `
    paramsArray.push(paymentTypeOnly)
  }

  baseSql += `
    GROUP BY time_slot, side
    ORDER BY time_slot;
  `

  const stmt = db.prepare(baseSql)
  const rows = stmt.all(...paramsArray)

  return rows.map((row: any) => ({
    side: row.side,
    time_slot: row.time_slot,
    weighted_avg_price: Number(row.weighted_avg_price),
    orders_count: row.orders_count,
    ads: JSON.parse(row.ads_json),
  }))
}
