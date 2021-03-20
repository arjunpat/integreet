import { io } from 'socket.io-client'
import { serverURL, debug } from './util'

const socket = io(serverURL, { autoConnect: false })

socket.onAny((...args) => {
  if (debug) console.log('SOCKET: ', args)
})

export default socket