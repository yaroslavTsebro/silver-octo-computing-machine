import Fastify from 'fastify'
import p2pRoutes from './p2p/index.js'
import cors from '@fastify/cors'

export const buildApp = async () => {
  const app = Fastify()

  await app.register(cors, {
    origin: true, // или указать ['http://localhost:3000']
  })

  app.register(p2pRoutes, { prefix: '/p2p' })

  return app
}


export const startServer = async () => {
  const app = await buildApp()

  app.listen({ port: 3001 }, (err, address) => {
    if (err) {
      app.log.error(err)
      process.exit(1)
    }
    console.log(`🚀 Server listening at ${address}`)
  })
}
