const socket = io();
var local_stream;
var screenStream;
var peer = null;
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
var screenSharing = false
var shouldFaceUser = true;
var defaultsOpts = { audio: true, video: true }
defaultsOpts.video = { facingMode: shouldFaceUser ? 'user' : 'environment' }
var peerConfig = {
    'iceServers': [
        { url: 'stun:stun.l.google.com:19302' },
    ]
    // host: 'localhost',
    // port: 9000,
    // path: '/chat' 
}

var peers = {}

function showPassword() {
    if ($('.show_password').prop('checked'))
        $('input[name=password]').attr('type', 'text')
    else
        $('input[name=password]').attr('type', 'password')
}

function prepareJoinTransmissionVideo(data) {
    var nameRoom = "ROOM_" + data.id;
    console.log(data)
    $('#container_video_voice #btn_close_voice_room').fadeIn().show()
    joinRoom(nameRoom);
}

function prepareTransmissionVideo(id, author, username, username_author) {
    var nameRoom = "ROOM_" + id
    $('#container_video_voice').fadeIn().show()
    $('#container_video_voice .room_before').fadeIn().show()
    $('#container_video_voice #btn_close_voice_room').fadeIn().show()
    $('#container_video_voice .room_before .title_username').html(username)
    createRoom(nameRoom, id, author, username, username_author);
}

function prepareTransmissionAudio() { }

function createRoom(code, id_send, author, username, username_author) {
    peer = new Peer(code, peerConfig)
    peer.on('open', (id) => {
        getUserMedia({ audio: true, video: true }, (stream) => {
            socket.emit('join-room', code, stream.id)
            socket.emit('initCallVideo', {
                id: id_send,
                author: author,
                username: username,
                username_author: username_author
            })
            console.log('criou a transmissão')

            mutedVoice(stream)            
        }, (err) => {
            //showErros();
            console.log(err)
        })
    })
    peer.on('call', (call) => {
        call.answer(local_stream);
        var i = 0;
        closeRoom(call)
        call.on('stream', (stream) => {
            i++
            if (i == 1) {
                console.log('novo usuário entrou')
                console.log(stream)
                $('#container_video_voice .room_before').fadeOut().hide();
                $('#container_video_voice .room_after').fadeIn().show();
                $('#container_video_voice .title_username ').html(username);
                setRemoteStream(stream);
            }
            peers[stream.id] = call

        })

        

        call.on('close', function (obj) {
            console.log('transmissão fechada 1')
        });

    })

    peer.on('close', function (obj) {
        console.log('transmissão fechada 2')
    });

    peer.on('disconnected', function (obj) {
        console.log('reconectando')
        peer.reconnect();
    });
}

function setLocalStream(stream) {
    let video = document.getElementById("video_palestra");
    video.srcObject = stream;
    video.muted = true;
    video.style.transform = 'scale(-1, 1)';
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
}

function setRemoteStream(stream) {
    let divVideo = document.getElementById('remote_stream');
    const myVideo = document.createElement('video')
    myVideo.srcObject = stream;
    myVideo.muted = false
    myVideo.style.transform = 'scale(-1, 1)';
    myVideo.controls = false
    myVideo.addEventListener('loadedmetadata', () => {
        myVideo.play();
    });
    divVideo.append(myVideo)
}

function handlePeerDisconnect() {
    // manually close the peer connections
    for (let conns in peer.connections) {
        peer.connections[conns].forEach((conn, index, array) => {
            console.log(`closing ${conn.connectionId} peerConnection (${index + 1}/${array.length})`, conn.peerConnection);
            conn.peerConnection.close();

            // close it using peerjs methods
            if (conn.close)
                conn.close();
        });
    }
}

function mutedVoice(stream){
    $('#footer_bar_options #btn_muted_voice_room').click(function () {
        const enabled = stream.getAudioTracks()[0].enabled;
        if (enabled) {
            stream.getAudioTracks()[0].enabled = false;
            $('#footer_bar_options #btn_muted_voice_room span img').attr('src', '/img/mic-mute-fill.svg')
        } else {
            stream.getAudioTracks()[0].enabled = true;
            $('#footer_bar_options #btn_muted_voice_room span img').attr('src', '/img/mic-bi-mute-fill.svg')
        }
    })
}

function joinRoom(code) {
    console.log('código na transmissão')
    console.log(code)
    peer = new Peer(undefined, peerConfig)
    peer.on('open', (id) => {
        getUserMedia({ audio: true, video: true }, (stream) => {
            socket.emit('join-room', code, stream.id)

            let call = peer.call(code, stream)
            var i = 0;
            console.log('abriu a chamada')
            console.log(call)

            closeRoom(call)
            mutedVoice(stream)
            
            call.on('stream', (stream) => {
                console.log('passou aqui')
                console.log(stream)
                i++
                if (i == 1) {
                    setRemoteStream(stream)
                }
                peers[code] = call
            })

            call.on('close', function (obj) {
                console.log('Passou na função close do peerJs')
            });

            call.on('disconnected', function (obj) {
                console.log('reconectando')
                peer.reconnect(obj);
            });
        }, (err) => {
            //showErros();
            console.log(err)
        })
    })

}

socket.on('user-connected', userId => {
    console.log("User Connected " + userId)
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
    $('#container_video_voice').fadeOut(1000);
})

function closeRoom(call) {
    $('#container_video_voice #btn_close_voice_room').click(function(){
        call.close()
        handlePeerDisconnect()
        $('#container_video_voice #remote_stream video').remove();
        $('#container_video_voice').fadeOut(500);
        $('#container_video_voice .room_after').hide();
        location.reload()
    })
}