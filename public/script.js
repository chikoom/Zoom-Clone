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

let videoStream

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: false,
  })
  .then(stream => {
    videoStream = stream
    addVideoStream(myVideo, stream)

    socket.on('user-conncted', userID => {
      connectToNewUser(userID, stream)
    })
  })

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
