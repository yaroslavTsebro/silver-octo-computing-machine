import { FastifyInstance } from 'fastify'
import { getAd } from './get-ad.js'
import { getAddsByAcc } from './get-ads-by-acc.js'
import { getAdvisorSnapshots } from './get-advisor.js'
import { getAllAdvisorsGrouped } from './get-advisors.js'
import { getUserVolumeDiff } from './get-user-volume-diff.js'

export default async function p2pRoutes(app: FastifyInstance) {
  app.get('/', getAd)
  app.get('/user/:userId', getAddsByAcc)
  app.get('/advisors/:userId', getAdvisorSnapshots)
  app.get('/advisors', getAllAdvisorsGrouped)
  app.get('/ad-stats', getUserVolumeDiff)
  app.get('/:id', getAd)
}
