import { FastifyInstance } from 'fastify'
import { getAd } from './get-ad.js'
import { getAddsByAcc } from './get-ads-by-acc.js'
import { getAdvisorSnapshots } from './get-advisor.js'
import { getAllAdvisorsGrouped } from './get-advisors.js'
import { getUserVolumeDiff } from './get-user-volume-diff.js'
import { get } from './test.js'
import { db } from 'db/index.js'

export default async function p2pRoutes(app: FastifyInstance) {
  app.get('/', getAd)
  app.get('/test', get)
  app.get('/user/:userId', getAddsByAcc)
  app.get('/advisors/:userId', getAdvisorSnapshots)
  app.get('/advisors', getAllAdvisorsGrouped)
  app.get('/ad-stats', getUserVolumeDiff)
  app.get('/:id', getAd)
  
  app.get('/agg/exact', async (req, reply) => {
    const { tokenId, currencyId, side, payment_ids, amount_range, from, to } = req.query as any;
    const rows = db.prepare(`
      SELECT * FROM ads_agg_exact
      WHERE tokenId = ? AND currencyId = ? AND side = ?
        AND payment_ids = ? AND amount_range = ?
        AND ts_bucket BETWEEN ? AND ?
      ORDER BY ts_bucket ASC
    `).all(tokenId, currencyId, side, payment_ids, amount_range, from, to);
    return rows;
  });

  app.get('/agg/payment', async (req, reply) => {
    const { tokenId, currencyId, side, payment_id, amount_range, from, to } = req.query as any;
    const rows = db.prepare(`
      SELECT * FROM ads_agg_by_payment
      WHERE tokenId = ? AND currencyId = ? AND side = ?
        AND payment_id = ? AND amount_range = ?
        AND ts_bucket BETWEEN ? AND ?
      ORDER BY ts_bucket ASC
    `).all(tokenId, currencyId, side, payment_id, amount_range, from, to);
    return rows;
  });

  app.get('/agg/payment/popularity', async (req, reply) => {
    const { tokenId, currencyId, side, from, to } = req.query as any;
    const rows = db.prepare(`
      SELECT payment_id, SUM(volume_total) as total_volume, SUM(ad_count) as total_ads, SUM(volume_total) / SUM(ad_count) as avg_price
      FROM ads_agg_by_payment
      WHERE tokenId = ? AND currencyId = ? AND side = ? AND ts_bucket BETWEEN ? AND ?
      GROUP BY payment_id
      ORDER BY total_volume DESC
    `).all(tokenId, currencyId, side, from, to);
    return rows;
  });

  app.get('/agg/payment/popularity/split', async (req, reply) => {
    const { tokenId, currencyId, from, to } = req.query as any;
    const rows = db.prepare(`
      SELECT payment_id, side, SUM(volume_total) as total_volume, SUM(ad_count) as total_ads, SUM(volume_total) / SUM(ad_count) as avg_price
      FROM ads_agg_by_payment
      WHERE tokenId = ? AND currencyId = ? AND ts_bucket BETWEEN ? AND ?
      GROUP BY payment_id, side
      ORDER BY payment_id, side
    `).all(tokenId, currencyId, from, to);
    return rows;
  });

  app.get('/ads/by-user', async (req, reply) => {
    const { userId, from, to } = req.query as any;
    const rows = db.prepare(`
      SELECT * FROM ads
      WHERE userId = ? AND createdAt BETWEEN ? AND ?
      ORDER BY createdAt ASC
    `).all(userId, from, to);
    return rows;
  });

  app.get('/advisors/history', async (req, reply) => {
    const { userId, from, to } = req.query as any;
    const rows = db.prepare(`
      SELECT * FROM advisors
      WHERE userId = ? AND createdAt BETWEEN ? AND ?
      ORDER BY createdAt ASC
    `).all(userId, from, to);
    return rows;
  });

  app.get('/ads/volume-price', async (req, reply) => {
    const { adId } = req.query as any;
    const rows = db.prepare(`
      SELECT createdAt, lastQuantity, price FROM ads
      WHERE adId = ?
      ORDER BY createdAt ASC
    `).all(adId);
    return rows;
  });
}
