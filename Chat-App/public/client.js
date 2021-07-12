const socket = io()

let userName
let textarea = document.querySelector('#textarea')
let messageArea = document.querySelector('.message_box')
let userList = document.querySelector('#user')

// prompt for UserName
do {
    userName = prompt('Enter your name: ')
} while(!userName)

// participats list
userList.innerHTML += `<li>${userName}</li>`
socket.emit('name', userName)

socket.on('name', (msg) => {
    userList.innerHTML += `<li>${msg}</li>`
})

// click enter to send message
textarea.addEventListener('keyup', (event) => {
    if(event.key === 'Enter') {
        sendMessage(event.target.value)
    }
})

function sendMessage(message) {
    let msg = {
        user: userName,
        message: message.trim()
    }
    // Append to the message-box
    appendMessage(msg, 'outgoing')
    textarea.value = ''
    scrollToBottom()

    // Send to other users through server
    socket.emit('message', msg)

}

function appendMessage(msg, type) {
    let mainDiv = document.createElement('div')
    let className = type
    mainDiv.classList.add(className, 'message')

    let markup = `
        <h4>${msg.user}</h4>
        <p>${msg.message}</p>
    `
    mainDiv.innerHTML = markup
    messageArea.appendChild(mainDiv)
}

// Recieve messages 
socket.on('message', (msg) => {
    appendMessage(msg, 'incoming')
    scrollToBottom()
})

function scrollToBottom() {
    messageArea.scrollTop = messageArea.scrollHeight
}

// share invite link
function invite() {
    alert("Copy Link And Share: https://microsoft-chat-app.herokuapp.com/")
}

//Prompt the user before leaving chat room
document.getElementById('leave_button').addEventListener('click', () => {
    const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
    if (leaveRoom) {
      window.location = "https://micro-video-chat-app.herokuapp.com/";
    } else {
    }
});

