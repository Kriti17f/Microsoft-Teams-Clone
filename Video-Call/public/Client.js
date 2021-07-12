const HOST = location.origin.replace(/^http/, 'ws')
const webSocket = new WebSocket(HOST) 

var homePage = document.getElementById("main")
var videoChatPage = document.getElementById("container")
var localVideo = document.getElementById("local-video")
var remoteVideo = document.getElementById("remote-video")
var roomID = document.getElementById("roomID-input")

let localStream
let peerConnection

// handle received socket messages 
webSocket.onmessage = (event) => {
    handleSignallingData(JSON.parse(event.data))
} 

function handleSignallingData(data) {
    switch (data.type) {
        case "answer":
            peerConnection.setRemoteDescription(data.answer)
            break
        case "candidate":
            peerConnection.addIceCandidate(data.candidate)
        case "offer":
            peerConnection.setRemoteDescription(data.offer)
            createAndSendAnswer()
            break
        default:
            break
    }
}

// create a new rtc peer connection
function createPeerConnection() {
    let configuration = {
        iceServers: [
            {
                "urls": ["stun:stun.l.google.com:19302", 
                "stun:stun1.l.google.com:19302", 
                "stun:stun2.l.google.com:19302"]
            }
        ]
    }
    peerConnection = new RTCPeerConnection(configuration)
    peerConnection.addStream(localStream)

    // called whenever it receive a video or audio stream from RTCPeerConnection 
    peerConnection.onaddstream = (event) => {
        remoteVideo.style.display = "block"
        remoteVideo.srcObject = event.stream
    }
}
 
// send data to the client through server
function sendData(data) {
    data.roomID = roomID.value
    webSocket.send(JSON.stringify(data))
}

// starting a call 
function startCall() {
    homePage.style.display = "none"
    videoChatPage.style.display = "flex"
    localVideo.style.display = "block"

    sendData({
        type: "add_newUser"
    })

    // with the user’s permission, activate camera and microphone
    navigator.getUserMedia({
        video: {
            frameRate: 24,
            width: {
                min: 480, ideal: 720, max: 1280
            },
            aspectRatio: 1.33333
        },
        audio: true
    }, (stream) => {
        localStream = stream
        localVideo.srcObject = localStream

        createPeerConnection()

        // called whenever an ICE candidate is received from STUN/TURN server
        // This candidate will be sent to the other peer as soon as it is received
        peerConnection.onicecandidate = ((event) => {
            if (event.candidate == null)
                return
            sendData({
                type: "candidate",
                candidate: event.candidate
            })
        })

        createAndSendOffer()
    }, (error) => {
        console.log(error)
    })
}

// sender creates and sends offer
function createAndSendOffer() {
    peerConnection.createOffer((offer) => {
        sendData({
            type: "offer",
            offer: offer
        })

        peerConnection.setLocalDescription(offer) // save the offer in the sender's session
    }, (error) => {
        console.log(error)
    })
}

// receiver creates and sends the anwser
function createAndSendAnswer () {
    peerConnection.createAnswer((answer) => {
        peerConnection.setLocalDescription(answer) // save the answer locally
        sendData({
            type: "send_answer",
            answer: answer
        })
    }, error => {
        console.log(error)
    })
}

// joining a call
function joinCall() {
    homePage.style.display = "none"
    videoChatPage.style.display = "flex"
    localVideo.style.display = "block"

    // with the user’s permission, activate camera and microphone
    navigator.getUserMedia({
        video: {
            frameRate: 24,
            width: {
                min: 480, ideal: 720, max: 1280
            },
            aspectRatio: 1.33333
        },
        audio: true
    }, (stream) => {
        localStream = stream
        localVideo.srcObject = localStream

        createPeerConnection()

        // called whenever an ICE candidate is received from STUN/TURN server
        // This candidate will be sent to the other peer as soon as it is received
        peerConnection.onicecandidate = ((event) => {
            if (event.candidate == null)
                return
            
            sendData({
                type: "send_candidate",
                candidate: event.candidate
            })
        })

        sendData({
            type: "join_call"
        })

    }, (error) => {
        console.log(error)
    })
}

// leave call: disconnect peerConnection
function leave(){
    muteVideo()
    muteAudio()
    window.location.href = 'https://micro-video-chat-app.herokuapp.com/';
    // peerConnection.close()
}

// invite-box
let inviteBox = document.getElementById("invite-box-container")
let ID = document.getElementById("roomID")
function invite() {
    inviteBox.style.display = "block"
    ID.innerHTML= "RoomId: "+ roomID.value 
}

// close invite-box
window.onclick = function(event) {
    if (event.target == inviteBox) {
      inviteBox.style.display = "none";
    }
}


// Audio Action
let isAudio = true
function muteAudio() {
    isAudio = !isAudio
    if(!isAudio)
        document.getElementById("muteAudio").style.color = "red"
    else
        document.getElementById("muteAudio").style.color = "green"
    localStream.getAudioTracks()[0].enabled = isAudio
}

// Video Action
let isVideo = true
function muteVideo() {
    isVideo = !isVideo
    if(!isVideo)
         document.getElementById("muteVideo").style.color = "red"
    else
        document.getElementById("muteVideo").style.color = "green"
    localStream.getVideoTracks()[0].enabled = isVideo
}

function zoomin(vid) {
    var currWidth = localVideo.clientWidth
    var currHeigth = localVideo.clientHeight
    var rcurrWidth = remoteVideo.clientWidth
    var rcurrHeigth = remoteVideo.clientHeight
    if(vid == "local") {
        localVideo.style.width = (currWidth + 100) + "px"
        localVideo.style.height = (currHeigth + 60) + "px"
        if(remoteVideo.style.display == "block") {
            remoteVideo.style.width = (rcurrWidth - 100) + "px"
            remoteVideo.style.height = (rcurrHeigth - 60) + "px"
        }
    }
    else {
        remoteVideo.style.width = (rcurrWidth + 100) + "px";
        remoteVideo.style.height = (rcurrHeigth + 60) + "px"
        localVideo.style.width = (currWidth - 100) + "px";
        localVideo.style.height = (currHeigth - 60) + "px"
    }
}

function reset() {
    localVideo.style.width = "45%"
    localVideo.style.height = "500px"
    remoteVideo.style.width = "45%"
    remoteVideo.style.width = "500px"
}
