import socketClient from './socketClient'

// Example mining functions — replace with your real mining logic
export function startMining(params) {
    console.log('[Mining] startMining', params)
    // TODO: start GPU worker / allocate resources
}

export function stopMining() {
    console.log('[Mining] stopMining')
    // TODO: stop workers / cleanup
}

export function statusRequest(params) {
    console.log('[Mining] statusRequest', params)
}

// Called by the app once to register message handlers
export function setupMiningHandlers() {
    // Register by message method names — these are just examples
    socketClient.registerHandler('startMining', (params) => startMining(params))
    socketClient.registerHandler('stopMining', () => stopMining())
    socketClient.registerHandler('status', (params) => statusRequest(params))

    // optional wildcard handler for diagnostics
    socketClient.registerHandler('*', (msg) => console.debug('[Mining] wildcard', msg))
}

export default {
    startMining,
    stopMining,
    setupMiningHandlers,
}