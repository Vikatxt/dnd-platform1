import { io } from 'socket.io-client'

let socket

export const connectSocket = () => {
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'
    console.log('🔌 Connecting to socket server:', socketUrl)
    
    socket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
    
    socket.on('connect', () => {
      console.log('✅ Socket connected with ID:', socket.id)
    })
    
    socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message)
    })
    
    socket.on('disconnect', (reason) => {
      console.warn('🔌 Socket disconnected:', reason)
    })
  }
  return socket
}

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket is not connected. Call connectSocket() first.')
  }
  return socket
}
