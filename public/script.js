const ws = new WebSocket("ws://192.168.100.15:3000")
const isConnectionOpen = ws.OPEN === ws.readyState

const form = document.getElementById("login-form")
const userInput = document.getElementById("username")
const passInput = document.getElementById("password")
const errorMessage = document.getElementById("error-message")

if (!isConnectionOpen) {
	ws.addEventListener("open", () => {
		console.log("Conexión WebSocket abierta")
	})

	ws.addEventListener("message", ({data}) => {
		console.log("mensaje del server", data)
		const response = JSON.parse(data)
		if (response.status === 403) {
			errorMessage.innerHTML = response.message
			return
		}
		if (response.status === 200) {
			const username = userInput.value
			const password = passInput.value
			localStorage.setItem("user", JSON.stringify({user: username, password}))
			userInput.value = ""
			passInput.value = ""
			window.location.href = "chat.html"
		}
	})
}

form.addEventListener("submit", event => {
	event.preventDefault()
	const username = userInput.value
	const password = passInput.value
	const userParam = JSON.stringify({username, password})
	ws.send(userParam)
})
