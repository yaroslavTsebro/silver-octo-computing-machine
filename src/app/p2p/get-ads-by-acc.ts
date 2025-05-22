import { db } from 'db/index.js'
import { FastifyRequest, FastifyReply } from 'fastify'

type GetUserOrdersParams = {
  userId: string
}

type GetUserOrdersQuery = {
  side?: 'buy' | 'sell' | 'both'
  from?: string
  to?: string
  stepInMinutes?: string
}

export async function getAddsByAcc(
  request: FastifyRequest<{ Params: GetUserOrdersParams, Querystring: GetUserOrdersQuery }>,
  reply: FastifyReply
) {
  const { userId } = request.params
  const { side = 'both', from, to, stepInMinutes = '60' } = request.query

  const step = parseInt(stepInMinutes, 10)
  if (isNaN(step) || step <= 0) {
    return reply.code(400).send({ error: 'Invalid stepInMinutes' })
  }

  const filterConditions: string[] = ['userId = ?']
  const params: any[] = [userId]

  if (side === 'buy') {
    filterConditions.push('side = 0')
  } else if (side === 'sell') {
    filterConditions.push('side = 1')
  }

  if (from) {
    filterConditions.push('createdAt >= ?')
    params.push(from)
  }

  if (to) {
    filterConditions.push('createdAt <= ?')
    params.push(to)
  }

  const whereClause = filterConditions.length ? `WHERE ${filterConditions.join(' AND ')}` : ''

  // 1. Все объявления
  const adsSql = `SELECT * FROM ads ${whereClause} ORDER BY createdAt DESC`
  const ads = db.prepare(adsSql).all(...params)

  // 2. Агрегация по времени
  const dynamicSql = `
    SELECT
      DATETIME(
        STRFTIME('%s', createdAt) / (${step} * 60) * (${step} * 60),
        'unixepoch'
      ) AS time_slot,
      SUM(CAST(quantity AS REAL)) AS totalQuantity,
      SUM(CAST(lastQuantity AS REAL)) AS totalLastQuantity
    FROM ads
    ${whereClause}
    GROUP BY time_slot
    ORDER BY time_slot;
  `
  const dynamics = db.prepare(dynamicSql).all(...params)

  return reply.send({
    userId,
    total: ads.length,
    items: ads,
    dynamics,
  })
}
