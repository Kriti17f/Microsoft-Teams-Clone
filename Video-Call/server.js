const express = require("express")
const app = express()

app.use(express.static("public"))

app.get('/', function (req, res) {
    res.redirect('/Client.html')
});

const Socket = require("websocket").server
const http = require("http")

const server = http.createServer(app)

var port = process.env.PORT || 8080
server.listen(port, () => {
    console.log(`Listening on port ${port}...`)
})

const webSocket = new Socket({ httpServer: server })

// stores connected users
let clients = []

webSocket.on('request', (req) => {
    const connection = req.accept()

    connection.on('message', (message) => {
        const data = JSON.parse(message.utf8Data)

        const user = findUser(data.roomID)

        switch(data.type) {
            case "add_newUser":
                if (user != null) {
                    return
                }
                const newUser = {
                     conn: connection,
                     roomID: data.roomID
                }
                clients.push(newUser)
                console.log(newUser.roomID)
                break

            case "offer":
                if (user == null)
                    return
                user.offer = data.offer
                break
            
            case "candidate":
                if (user == null) {
                    return
                }
                if (user.candidates == null)
                    user.candidates = []

                user.candidates.push(data.candidate)
                break

            case "send_answer":
                if (user == null) {
                    return
                }

                sendData({
                    type: "answer",
                    answer: data.answer
                }, user.conn)
                break

            case "send_candidate":
                if (user == null) {
                    return
                }

                sendData({
                    type: "candidate",
                    candidate: data.candidate
                }, user.conn)
                break

            case "join_call":
                if (user == null) {
                    return
                }

                sendData({
                    type: "offer",
                    offer: user.offer
                }, connection)
                
                user.candidates.forEach(candidate => {
                    sendData({
                        type: "candidate",
                        candidate: candidate
                    }, connection)
                })
                break
        }
    })

    connection.on('close', (reason, description) => {
        clients.forEach(user => {
            if (user.conn == connection) {
                clients.splice(clients.indexOf(user), 1)
                return
            }
        })
    })
})

function sendData(data, conn) {
    conn.send(JSON.stringify(data))
}

function findUser(roomID) {
    for (let i = 0;i < clients.length;i++) {
        if (clients[i].roomID == roomID)
            return clients[i]
    }
}