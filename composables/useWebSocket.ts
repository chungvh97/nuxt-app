type WebSocketMessage = {
    type: string
    payload?: any
}

export function useWebSocket(
    onMessage: (data: WebSocketMessage) => void,
    options?: {
        reconnectInterval?: number
        onOpen?: () => void
        onClose?: () => void
    }
) {
    let ws: WebSocket
    const reconnectInterval = options?.reconnectInterval ?? 2000

    const connect = () => {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
        const wsUrl = `${protocol}://${window.location.host}/api/ws`

        ws = new WebSocket(wsUrl)

        ws.onopen = () => {
            console.log('✅ WebSocket connected:', wsUrl)
            options?.onOpen?.()
        }

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data)
                onMessage(msg)
            } catch (err) {
                console.warn('⚠️ Invalid JSON WebSocket message:', event.data)
            }
        }

        ws.onerror = (err) => {
            console.error('❌ WebSocket error:', err)
        }

        ws.onclose = () => {
            console.warn('🔌 WebSocket closed. Reconnecting...')
            options?.onClose?.()
            setTimeout(connect, reconnectInterval)
        }
    }

    connect()

    return {
        send: (message: WebSocketMessage) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(message))
            } else {
                console.warn('⚠️ WebSocket is not open. Message not sent.')
            }
        }
    }
}
