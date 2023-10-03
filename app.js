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
	activeConnections.forEach(connection => {
		const jsonMessages = JSON.parse(fs.readFileSync("./logs/messages.json"))
		const jsonUsers = JSON.parse(fs.readFileSync("./logs/users.json"))
		connection.send(JSON.stringify({messages: jsonMessages, usersLogged: jsonUsers}))
	})

	ws.on("message", res => {
		const response = JSON.parse(res)
		if (response.petition === "DELETE") {
			const jsonUsers = JSON.parse(fs.readFileSync("./logs/users.json"))
			const usersFiltered = jsonUsers.filter(i => {
				return i?.username !== response.user
			})
			fs.writeFileSync("./logs/users.json", JSON.stringify(usersFiltered))
			activeConnections.forEach(connection => {
				connection.send(JSON.stringify({message: "unlogged", usersLogged: usersFiltered}))
			})
			return
		}
		if (response.username) {
			const jsonUsers = JSON.parse(fs.readFileSync("./logs/users.json"))
			const isUserFound = jsonUsers.find(i => {
				return i?.username === response.username
			})
			if (!isUserFound) {
				const newUsers = [...jsonUsers, response]
				fs.writeFileSync("./logs/users.json", JSON.stringify(newUsers))
				ws.send(JSON.stringify({status: 200, message: "ok"}))
				return
			}
			if (isUserFound.password === response.password) {
				ws.send(JSON.stringify({status: 200, message: "ok"}))
				return
			}
			ws.send(JSON.stringify({status: 403, message: "Constraseña incorrecta"}))
			return
		}
		const jsonMessages = JSON.parse(fs.readFileSync("./logs/messages.json"))
		response.id = jsonMessages.length
		const newMessages = [...jsonMessages, response]
		fs.writeFileSync("./logs/messages.json", JSON.stringify(newMessages))
		activeConnections.forEach(connection => {
			connection.send(JSON.stringify({messages: newMessages, usersLogged: []}))
		})
	})
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
	console.log(`Servidor Node.js escuchando en el puerto ${PORT}`)
})
