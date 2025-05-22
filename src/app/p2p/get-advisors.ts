import { db } from 'db/index.js'
import { FastifyRequest, FastifyReply } from 'fastify'

type Query = {
  from?: string
  to?: string
  limit?: string
  page?: string
}

export async function getAllAdvisorsGrouped(
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

  // Получить уникальные userId с пагинацией
  const idSql = `
    SELECT DISTINCT userId
    FROM advisors
    WHERE ${whereClause}
    ORDER BY userId
    LIMIT ? OFFSET ?
  `
  const idRows: any[] = db.prepare(idSql).all(...params, parsedLimit, offset)
  const userIds = idRows.map((r) => r.userId)

  if (userIds.length === 0) {
    return reply.send({ count: 0, page: parsedPage, data: {} })
  }

  // Получить все строки по userId
  const inPlaceholders = userIds.map(() => '?').join(', ')
  const fullSql = `
    SELECT *
    FROM advisors
    WHERE ${whereClause}
      AND userId IN (${inPlaceholders})
    ORDER BY userId, createdAt
  `

  const fullParams = [...params, ...userIds]
  const rows: any[] = db.prepare(fullSql).all(...fullParams)

  const grouped: Record<string, any[]> = {}
  for (const row of rows) {
    if (!grouped[row.userId]) grouped[row.userId] = []
    grouped[row.userId].push(row)
  }

  return reply.send({
    page: parsedPage,
    perPage: parsedLimit,
    count: userIds.length,
    data: grouped,
  })
}
