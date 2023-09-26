const ws = new WebSocket("ws://192.168.100.15:3000")
const isConnectionOpen = ws.OPEN === ws.readyState

const textInput = document.getElementById("text-input")
const submitButton = document.getElementById("submit-button")
const messageList = document.getElementById("messages")

if (!isConnectionOpen) {
	ws.addEventListener("open", () => {
		console.log("Conexión WebSocket abierta")
	})
	// Manejar los mensajes WebSocket entrantes (opcional)
	ws.addEventListener("message", event => {
		const {data} = event
		console.log("mensaje del server", data)
		const {message, date, user} = JSON.parse(data)// TODO hacer date
		const newParagraph = document.createElement("p")
		newParagraph.innerHTML = message
		if (user === "tadeo") {
			newParagraph.className = "own-message"
		}
		messageList.appendChild(newParagraph)
	})
}

textInput.addEventListener("keypress", event => {
	if (event.key === "Enter") {
		event.preventDefault()
		sendMessage()
	}
})

submitButton.addEventListener("click", event => {
	event.preventDefault()
	sendMessage()
})

const sendMessage = () => {
	const message = textInput.value
	textInput.value = ""
	if (message.length === 0) {
		return alert("Ingresá texto por favor")
	}
	textInput.value = ""
	const messageParam = JSON.stringify({message, date: new Date().toISOString(), user: "Tadeo"})
	ws.send(messageParam)
}
