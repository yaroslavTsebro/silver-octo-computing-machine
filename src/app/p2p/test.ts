import Database from 'better-sqlite3'
import { FastifyRequest, FastifyReply } from 'fastify'

const db = Database('bybit.db')

export async function get(
  request: FastifyRequest,
  reply: FastifyReply
) {

  try {
    const rows = db.prepare(`
    SELECT id, side, weighted_avg_price, volume, orders_count, createdAt
    FROM ads_price_chart
    ORDER BY createdAt ASC
  `).all()

    console.log(rows)
    return reply.send(rows)
  } catch (err) {
    console.error(err)
    reply.status(500).send({ error: 'Internal Server Error' })
  }
}