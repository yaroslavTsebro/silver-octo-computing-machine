import Fastify from 'fastify'
import p2pRoutes from './p2p/index.js'

export const buildApp = () => {
  const app = Fastify()

  app.register(p2pRoutes, { prefix: '/p2p' })

  return app
}

export const startServer = async () => {
  const app = buildApp()

  app.listen({ port: 3000 }, (err, address) => {
    if (err) {
      app.log.error(err)
      process.exit(1)
    }
    console.log(`🚀 Server listening at ${address}`)
  })
}
