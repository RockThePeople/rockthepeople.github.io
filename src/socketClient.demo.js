// Demo for socketClient dispatch & handler registry (no network required)
import socketClient from './socketClient'

// Register some fake handlers
socketClient.registerHandler('hello', (params, full) => {
  console.log('hello handler', params)
})

socketClient.registerHandler('*', (msg) => {
  console.log('wildcard', msg)
})

// dispatch a few test messages
socketClient.dispatch({ method: 'hello', params: { who: 'world' } })
socketClient.dispatch({ method: 'unknown', params: {} })

// unregister example
socketClient.unregisterHandler('hello')
socketClient.dispatch({ method: 'hello', params: { who: 'again' } })

// Output should show hello handler for the first message, wildcard for unknown/after unregister
