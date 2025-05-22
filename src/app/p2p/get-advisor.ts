// GET /advisors/:userId?snapshot=true&from=...&to=...

import { db } from 'db/index.js'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function getAdvisorSnapshots(
  request: FastifyRequest<{ Params: { userId: string }, Querystring: { from?: string, to?: string } }>,
  reply: FastifyReply
) {
  const { userId } = request.params
  const { from, to } = request.query

  const conditions = ['userId = ?']
  const params: any[] = [userId]

  if (from) {
    conditions.push('createdAt >= ?')
    params.push(from)
  }
  if (to) {
    conditions.push('createdAt <= ?')
    params.push(to)
  }

  const sql = `
    SELECT *
    FROM advisors
    WHERE ${conditions.join(' AND ')}
    ORDER BY createdAt ASC
  `
  const data = db.prepare(sql).all(...params)
  return reply.send({ userId, count: data.length, snapshots: data })
}
