const { WebSocketServer } = require('ws')
const http = require('http')

const server = http.createServer()
const wss = new WebSocketServer({ server })

wss.on('connection', (ws) => {
    console.log('🔌 Client connected')

    ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to external WS server' }))

    ws.on('message', (msg) => {
        console.log('📩 Received:', msg.toString())

        console.log('msg.toString()', msg.toString())
        if (msg.toString() === 'simulate-payment') {
            const payload = {
                type: 'payment_received',
                payload: {
                    name: 'Vũ Thị Ngọc Trâm',
                    amount: 130
                }
            }
            console.log('1212')

            wss.clients.forEach(client => {
                if (client.readyState === 1) {
                    client.send(JSON.stringify(payload))
                }
            })
        }
    })
})

server.listen(3001, () => {
    console.log('🟢 WS server running at ws://localhost:3001')
})
