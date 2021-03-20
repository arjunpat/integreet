let io;

exports.io = () => {
  return io
}

exports.initialize = (server) => {
  io = require('socket.io')(server, {
    cors: {
      origin: 'http://localhost:8080',
    },
  })

  // Middleware
  io.use((socket, next) => {
    const username = socket.handshake.auth.username
    if (!username) {
      return next(new Error('invalid username'))
    }
    socket.username = username
    socket.x = 0
    socket.y = 0
    socket.velX = 0
    socket.velY = 0
    next()
  })

  const getUserData = (socket) => {
    return {
      uid: socket.id,
      username: socket.username,
      x: socket.x,
      y: socket.y,
      velX: socket.velX,
      velY: socket.velY,
    }
  }

  // Events
  io.on('connection', (socket) => {
    // Initial events on first connect
    const users = {}
    for (let [id, socket] of io.of('/').sockets) {
      users[id] = {
        uid: id,
        username: socket.username,
        x: socket.x,
        y: socket.y,
      }
    }
    socket.emit('users', users)

    socket.broadcast.emit('user connected', getUserData(socket))

    // Other events
    socket.on('set pos vel', ({ x, y, velX, velY }) => {
      socket.x = x
      socket.y = y
      socket.velX = velX
      socket.velY = velY

      socket.broadcast.emit('user updated', { uid: socket.id, x, y, velX, velY })
    })

    socket.on('disconnect', () => {
      socket.broadcast.emit('user disconnected', { uid: socket.id })
    })
  })
}