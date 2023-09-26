const express = require("express")
const http = require("http")
const WebSocket = require("ws")

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({server})

app.use(express.static("public"))

wss.on("connection", ws => {
	console.log("Cliente WebSocket conectado")
	ws.on("message", message => {
		console.log(`Mensaje recibido del navegador: ${message}`)
		ws.send(message.toString())
	})
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
	console.log(`Servidor Node.js escuchando en el puerto ${PORT}`)
})
