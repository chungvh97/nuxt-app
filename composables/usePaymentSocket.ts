import { usePaymentStore } from '~/stores/payment'

export function usePaymentSocket() {
    const store = usePaymentStore()

    const ws = new WebSocket('ws://localhost:3001') // ← kết nối WS server riêng

    ws.onopen = () => {
        console.log('✅ Connected to external WebSocket server')
    }

    ws.onmessage = (event) => {
        try {
            const msg = JSON.parse(event.data)
            if (msg.type === 'payment_received') {
                const { name, amount } = msg.payload
                store.markPaid(name, amount)
            }
        } catch (err) {
            console.warn('⚠️ Invalid message:', event.data)
        }
    }

    ws.onerror = (err) => {
        console.error('❌ WS Error:', err)
    }

    ws.onclose = () => {
        console.warn('🔌 WebSocket closed')
    }

    return ws
}
