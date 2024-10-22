import type { FastifyRequest } from 'fastify'

export function handleWebSocket(connection: any, _req: any) {
  connection.socket.on('message', (message) => {
    console.log('Received:', message.toString())
    connection.socket.send(JSON.stringify({ action: 'start' }))
  })

  connection.socket.on('close', () => console.log('socket disconnected'))
}
