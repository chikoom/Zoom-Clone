const { v4: uuidv4 } = require('uuid')
const express = require('express')
const path = require('path')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer')
const peerServer = ExpressPeerServer(server, {
  debug: true,
})
require('dotenv').config()

const { PORT } = process.env

app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, '/public')))
app.use(express.static(path.join(__dirname, '/node_modules')))

app.use('/peerjs', peerServer)
app.get('/', (req, res) => {
  res.redirect(`/${uuidv4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomID: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomID, userID) => {
    console.log('joined room!')
    console.log('Socket room ID', roomID)
    console.log('PEER user ID', userID)

    socket.join(roomID)
    socket.to(roomID).broadcast.emit('user-conncted', userID)
  })
})

server.listen(PORT, () => {
  console.log(`SERVER ON! PORT ${PORT}`)
})
