import { io } from 'socket.io-client'

// Simple singleton socket client + handler registry
let socket = null
const handlers = new Map()

function safeParse(msg) {
  if (!msg) return null
  if (typeof msg === 'string') {
    try { return JSON.parse(msg) } catch (e) { return msg }
  }
  return msg
}

export function connect(url, opts = {}) {
  if (socket) return socket
  socket = io(url, opts)

  socket.on('connect', () => {
    console.log('[socketClient] connected', socket.id)
  })

  socket.on('disconnect', (reason) => {
    console.log('[socketClient] disconnected', reason)
  })

  // Default incoming event — adapt to your server's event names
  socket.on('message', (m) => {
    const msg = safeParse(m)
    dispatch(msg)
  })

  // also accept 'data' or other named events
  socket.on('data', (m) => {
    const msg = safeParse(m)
    dispatch(msg)
  })

  return socket
}

export function getSocket() {
  return socket
}

export function registerHandler(method, handler) {
  if (!method || typeof handler !== 'function') return
  handlers.set(method, handler)
}

export function unregisterHandler(method) {
  handlers.delete(method)
}

export function dispatch(msg) {
  if (!msg) return
  // expect message shape: { method: 'name', params: {...} }
  const method = msg.method || msg.type
  if (!method) {
    console.warn('[socketClient] received message without method/type', msg)
    return
  }

  const handler = handlers.get(method)
  if (handler) {
    try { handler(msg.params, msg) } catch (e) { console.error(e) }
  } else if (handlers.has('*')) {
    // wildcard handler receives full message
    handlers.get('*')(msg)
  } else {
    console.warn(`[socketClient] no handler for method=${method}`)
  }
}

export default {
  connect,
  getSocket,
  registerHandler,
  unregisterHandler,
  dispatch,
}
