console.log('Script file :', 'script.js')
const socket = io()
const myVideo = document.createElement('video')
myVideo.muted = true
var getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia

const peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '3030',
})

var videoStream

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then(stream => {
    videoStream = stream
    addVideoStream(myVideo, stream)

    socket.on('user-conncted', userID => {
      connectToNewUser(userID, stream)
    })
  })

const muteUnmute = () => {
  const enabled = videoStream.getAudioTracks()[0].enabled
  if (enabled) {
    videoStream.getAudioTracks()[0].enabled = false
    $('#muteUnmute').text('Unmute')
  } else {
    videoStream.getAudioTracks()[0].enabled = true
    $('#muteUnmute').text('Mute')
  }
}

const playStop = () => {
  const enabled = videoStream.getVideoTracks()[0].enabled
  if (enabled) {
    videoStream.getVideoTracks()[0].enabled = false
    $('#playStop').text('Play video')
  } else {
    videoStream.getVideoTracks()[0].enabled = true
    $('#playStop').text('Stop video')
  }
}

const addVideoStream = (video, stream) => {
  console.log('Adding video stream')
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    console.log('metadata')
    video.play()
  })
  document.getElementById('video-grid').append(video)
}

const connectToNewUser = (userID, stream) => {
  console.log('user-connected with id:', userID)
  const call = peer.call(userID, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
}

peer.on('open', id => {
  console.log('PEER ID', id)
  socket.emit('join-room', ROOM_ID, id)
})

peer.on('call', function (call) {
  console.log('Got call')
  getUserMedia(
    { video: true, audio: true },
    function (stream) {
      console.log('Got user media')
      call.answer(stream) // Answer the call with an A/V stream.
      call.on('stream', function (remoteStream) {
        addVideoStream(myVideo, remoteStream)
      })
    },
    function (err) {
      console.log('Failed to get local stream', err)
    }
  )
})

let userName

$('#enterName').on('keydown', function (e) {
  if (e.which == 13 && $(this).val().length !== 0) {
    userName = $(this).val()
    $(this).val('')
    $('#chatMessage').show()
    $(this).hide()
  }
})

$('#chatMessage').on('keydown', function (e) {
  if (e.which == 13 && $(this).val().length !== 0) {
    socket.emit('message', { user: userName, msg: $(this).val() })
    $(this).val('')
  }
})

const scrollButtom = () => {
  $('.main-chat-window').scrollTop($('.main-chat-window').prop('scrollHeight'))
}

const createMsg = messageObj => {
  $('.main-chat-window').append(
    $(`<div><div>${messageObj.user}:</div><div>${messageObj.msg}</div></div>`)
  )
  scrollButtom()
}

socket.on('user-message', messageObj => {
  createMsg(messageObj)
})
