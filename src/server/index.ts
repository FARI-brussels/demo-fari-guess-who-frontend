import Fastify from 'fastify'
import socket from '@fastify/websocket'
import cors from '@fastify/cors'
import fastifyEnv from '@fastify/env'

const aiUrl = process.env.VITE_FASTIFY_AI_URL

const fastify = Fastify({ logger: true })

fastify.register(socket)

fastify.register(cors, {
  origin: 'http://localhost:5173'
})

const schema = {
  type: 'object',
  required: ['VITE_FASTIFY_AI_URL'],
  properties: {
    VITE_FASTIFY_AI_URL: { type: 'string' }
  }
}

const options = {
  dotenv: true,
  schema
}

fastify.register(fastifyEnv, options).ready((err) => {
  if (err) console.error(err)
  const aiUrl = fastify.config.VITE_FASTIFY_AI_URL
  console.log({ aiUrl })
})

const connections = new Set()

fastify.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (socket, req) => {
    connections.add(socket)
    socket.on('message', (message) => {
      const msg = message.toString()

      for (const connection of connections) {
        connection.send(msg)
      }
    })

    socket.on('close', () => connections.delete(socket))
  })
})

fastify.get('/initialize', async (_req, res) => {
  const aiUrl = fastify.config.VITE_FASTIFY_AI_URL

  try {
    await fetch(`${aiUrl}`)
    return res.send(res.status)
  } catch (error) {
    return res.status(500).send({
      message: 'Failed to initialize game',
      error
    })
  }
})

fastify.post('/ask', async (req, res) => {
  const { body } = req
  const aiUrl = fastify.config.VITE_FASTIFY_AI_URL

  const payload = JSON.stringify({ question: body })
  try {
    const response = await fetch(`${aiUrl}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: payload
    })
    const json = await response.json()
    return res.send(json)
  } catch (error) {
    return res.status(500).send({
      message: 'Failed to fetch from AI backend',
      error
    })
  }
})

fastify.post('/answer', async (req, res) => {
  const { body } = req as Record<string, any>
  const aiUrl = fastify.config.VITE_FASTIFY_AI_URL

  try {
    const response = await fetch(`${aiUrl}/process_answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body
    })
    const json = await response.json()
    return res.send(json)
  } catch (error) {
    return res.status(500).send({
      message: 'Failed to fetch from AI backend',
      error
    })
  }
})

fastify.listen({ port: 3000 }, (err, port) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`Server running at ${port}`)
})
