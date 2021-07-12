const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

const port = process.env.PORT || 6060

http.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

io.on('connection', (socket) => {
    console.log('Connected...')

    socket.on('name', (msg) => {
        console.log(msg)
        socket.broadcast.emit('name', msg)
    })
    
    socket.on('message', (msg) => {
        console.log(msg)
        socket.broadcast.emit('message', msg)
    })

})