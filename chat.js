const SIGNALING_URL = "https://p2p-pzh0.onrender.com";
const socket = io(SIGNALING_URL);
const username = localStorage.getItem("username");

document.getElementById("me").innerText = username;

let peerConnection;
let dataChannel;

const chatBox = document.getElementById("chat");
const msgInput = document.getElementById("msg");

// STUN server (darmowy Google)
const config = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

socket.emit("join", "default-room");

socket.on("user-joined", id => {
    document.getElementById("other").innerText = id;
    peerConnection = createPeer(true, id);
});

socket.on("signal", async ({ sender, signal }) => {
    if (!peerConnection) {
        document.getElementById("other").innerText = sender;
        peerConnection = createPeer(false, sender);
    }

    if (signal.type === "offer") {
        await peerConnection.setRemoteDescription(signal);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit("signal", {
            target: sender,
            signal: peerConnection.localDescription
        });
    } else if (signal.type === "answer") {
        await peerConnection.setRemoteDescription(signal);
    } else if (signal.candidate) {
        try {
            await peerConnection.addIceCandidate(signal);
        } catch (err) {
            console.warn("ICE error", err);
        }
    }
});

function createPeer(isInitiator, targetId) {
    const pc = new RTCPeerConnection(config);

    pc.onicecandidate = event => {
        if (event.candidate) {
            socket.emit("signal", {
                target: targetId,
                signal: event.candidate
            });
        }
    };

    if (isInitiator) {
        dataChannel = pc.createDataChannel("chat");
        setupDataChannel();
        pc.createOffer().then(offer => {
            pc.setLocalDescription(offer);
            socket.emit("signal", {
                target: targetId,
                signal: offer
            });
        });
    } else {
        pc.ondatachannel = event => {
            dataChannel = event.channel;
            setupDataChannel();
        };
    }

    return pc;
}

function setupDataChannel() {
    dataChannel.onmessage = e => {
        chatBox.value += `\n${document.getElementById("other").innerText}: ${e.data}`;
    };
}

function send() {
    const msg = msgInput.value;
    if (dataChannel && dataChannel.readyState === "open") {
        chatBox.value += `\n${username}: ${msg}`;
        dataChannel.send(msg);
        msgInput.value = "";
    }
}