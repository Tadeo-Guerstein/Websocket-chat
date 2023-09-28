const express = require("express")
const http = require("http")
const WebSocket = require("ws")
const fs = require("fs")

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({server})

app.use(express.static("public"))

const activeConnections = new Set()

wss.on("connection", ws => {
	console.log("Cliente WebSocket conectado")

	activeConnections.add(ws)
	const jsonMessages = JSON.parse(fs.readFileSync("./logs/messages.json"))
	ws.send(JSON.stringify(jsonMessages))

	ws.on("message", message => {
		console.log(`Mensaje recibido del navegador: ${message}`)
		const messageForJSON = JSON.parse(message)
		const jsonMessages = JSON.parse(fs.readFileSync("./logs/messages.json"))
		messageForJSON.id = jsonMessages.length
		const newMessages = [...jsonMessages, messageForJSON]
		fs.writeFileSync("./logs/messages.json", JSON.stringify(newMessages))
		activeConnections.forEach(connection => {
			connection.send(JSON.stringify(newMessages))
		})
	})
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
	console.log(`Servidor Node.js escuchando en el puerto ${PORT}`)
})
