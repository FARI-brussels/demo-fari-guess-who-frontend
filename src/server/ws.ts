export function handleWebSocket(connection: any, _req: any) {
  connection.socket.on('message', (_message) => {
    connection.socket.send(JSON.stringify({ action: 'start' }))
  })

  connection.socket.on('close', () => console.log('socket disconnected'))
}
