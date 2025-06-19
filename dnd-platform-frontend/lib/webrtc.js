let peerConnections = {}

export const initLocalStream = async () => {
  try {
    const constraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000,
      },
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints)

    if (!stream.getAudioTracks().length) {
      throw new Error('Немає аудіо треків')
    }

    stream.getAudioTracks().forEach(track => {
      track.enabled = true
    })

    return stream
  } catch (error) {
    console.error('❌ Помилка при отриманні аудіо потоку:', error)
    throw error
  }
}

export const createPeerConnection = (socket, targetId, onTrack, stream) => {
  const pc = new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
    iceCandidatePoolSize: 10,
  })

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('ice-candidate', {
        target: targetId,
        candidate: event.candidate,
      })
    }
  }

  pc.ontrack = (event) => {
    const remoteStream = event.streams[0]
    remoteStream.getTracks().forEach(track => track.enabled = true)
    onTrack(remoteStream, targetId)
  }

  pc.oniceconnectionstatechange = () => {
    console.log(`ICE (${targetId}):`, pc.iceConnectionState)
  }

  if (stream) {
    stream.getTracks().forEach(track => pc.addTrack(track, stream))
  }

  return pc
}

export const getPeerConnections = () => peerConnections

export const setPeerConnection = (id, pc) => {
  peerConnections[id] = pc
}

export const removePeerConnection = (id) => {
  if (peerConnections[id]) {
    try {
      peerConnections[id].close()
    } catch (err) {
      console.warn('Помилка при закритті PeerConnection:', err)
    }
    delete peerConnections[id]
  }
}
