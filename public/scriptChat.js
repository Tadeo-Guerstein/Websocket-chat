const ws = new WebSocket("ws://192.168.100.15:3000")
const isConnectionOpen = ws.OPEN === ws.readyState

const i18nOptions = {
	timeZone: "America/Argentina/Buenos_Aires",
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
	hour: "2-digit",
	minute: "2-digit"
}
const dateText = new Intl.DateTimeFormat("es-AR", i18nOptions).format(new Date())

const textInput = document.getElementById("text-input")
const submitButton = document.getElementById("submit-button")
const messageList = document.getElementById("messages")
const usersList = document.getElementById("users")
const singOut = document.getElementById("sign-out")

const wsSignOut = () => {
	const storageUser = JSON.parse(localStorage.getItem("user"))
	const messageParam = JSON.stringify({
		petition: "DELETE",
		...storageUser
	})
	ws.send(messageParam)
	window.location.href = "index.html"
}

const wsSendMessage = () => {
	const message = textInput.value
	if (message.length === 0) {
		return alert("Ingresá texto por favor")
	}
	textInput.value = ""
	const storageUser = JSON.parse(localStorage.getItem("user"))
	const messageParam = JSON.stringify({
		message,
		date: dateText,
		user: storageUser.user
	})
	ws.send(messageParam)
}

const setMessages = messages => {
	const arrayChilds = [...messageList.children].map(i => {
		return i.children[1]
	})
	const filteredMessages = messages.filter((i, index) => {
		return i.id !== arrayChilds[index]?.value
	})
	const sessionUser = JSON.parse(localStorage.getItem("user"))
	filteredMessages.forEach(i => {
		const {id, message, user, date} = i

		const newMessageContainer = document.createElement("div")
		newMessageContainer.className = "message other-message"
		if (user === sessionUser.user) {
			newMessageContainer.className = "message own-message"
		}

		const newHeaderMessage = document.createElement("div")
		newHeaderMessage.className = "row-header"

		const newUser = document.createElement("p")
		const newDate = document.createElement("p")
		const newParagraph = document.createElement("p")

		newUser.innerHTML = user
		newUser.className = "message-user"
		newParagraph.innerHTML = message
		newParagraph.value = id
		newDate.innerHTML = `${date.split(" ")[1]}`

		newHeaderMessage.appendChild(newUser)
		newHeaderMessage.appendChild(newDate)
		newMessageContainer.appendChild(newHeaderMessage)
		newMessageContainer.appendChild(newParagraph)
		messageList.appendChild(newMessageContainer)
	})
	messageList.scrollTop = messageList.scrollHeight;
}

const setUsers = users => {
	const arrayChilds = [...usersList.children].map(i => {
		return i
	})
	const filteredUsers = users.filter((i, index) => {
		return i.username !== arrayChilds[index]?.value
	})
	filteredUsers.forEach(i => {
		const {username} = i
		const newUser = document.createElement("p")
		newUser.innerHTML = username
		newUser.value = username
		usersList.appendChild(newUser)
	})
}

const setLoggedUsers = users => {
	usersList.innerHTML = ""
	users.forEach(i => {
		const {username} = i
		const newUser = document.createElement("p")
		newUser.innerHTML = username
		newUser.value = username
		usersList.appendChild(newUser)
	})
}

if (!isConnectionOpen) {
	ws.addEventListener("open", () => {
		console.log("Conexión WebSocket abierta")
	})

	ws.addEventListener("message", event => {
		console.log("mensaje del server", event)
		const {data} = event
		const {messages, usersLogged, message} = JSON.parse(data)
		if (message === "unlogged") {
			setLoggedUsers(usersLogged)
			return
		}

		setMessages(messages)
		setUsers(usersLogged)
	})
}

textInput.addEventListener("keypress", event => {
	if (event.key === "Enter") {
		event.preventDefault()
		wsSendMessage()
	}
})
submitButton.addEventListener("click", wsSendMessage)
singOut.addEventListener("click", wsSignOut)
