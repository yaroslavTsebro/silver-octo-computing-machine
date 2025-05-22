import { db } from 'db/index.js'
import { FastifyRequest, FastifyReply } from 'fastify'

type Query = {
  from?: string
  to?: string
  limit?: string
  page?: string
}

type VolumeDiffRow = {
  userId: string
  buy_volume: number
  sell_volume: number
  volume_diff: number
}

export async function getUserVolumeDiff(
  request: FastifyRequest<{ Querystring: Query }>,
  reply: FastifyReply
) {
  const { from, to, limit = '50', page = '1' } = request.query

  const parsedLimit = Math.max(1, parseInt(limit, 10) || 50)
  const parsedPage = Math.max(1, parseInt(page, 10) || 1)
  const offset = (parsedPage - 1) * parsedLimit

  const conditions = ['1=1']
  const params: any[] = []

  if (from) {
    conditions.push('createdAt >= ?')
    params.push(from)
  }
  if (to) {
    conditions.push('createdAt <= ?')
    params.push(to)
  }

  const whereClause = conditions.join(' AND ')

  const sql = `
    SELECT
      userId,
      SUM(CASE WHEN side = 0 THEN CAST(executedQuantity AS REAL) ELSE 0 END) AS buy_volume,
      SUM(CASE WHEN side = 1 THEN CAST(executedQuantity AS REAL) ELSE 0 END) AS sell_volume,
      ABS(
        SUM(CASE WHEN side = 1 THEN CAST(executedQuantity AS REAL) ELSE 0 END) -
        SUM(CASE WHEN side = 0 THEN CAST(executedQuantity AS REAL) ELSE 0 END)
      ) AS volume_diff
    FROM ads
    WHERE ${whereClause}
    GROUP BY userId
    ORDER BY volume_diff DESC
    LIMIT ? OFFSET ?
  `

  const rows: unknown[] = db.prepare(sql).all(...params, parsedLimit, offset)

  return reply.send({
    page: parsedPage,
    perPage: parsedLimit,
    count: rows.length,
    data: rows,
  })
}
