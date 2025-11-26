import { useEffect } from 'react'
import socketClient from './socketClient'

// React hook / initializer that connects and stores the socket on socketRef
export default function initSocket(socketRef, { url = 'https://117.16.244.34:8084', opts = {} } = {}) {
    useEffect(() => {
        socketRef.current = socketClient.connect(url, opts)

        const s = socketRef.current
        return () => {
            // optional: tidy up
            try { s && s.close && s.close() } catch (e) {}
            socketRef.current = null
        }
    }, [socketRef, url])
}