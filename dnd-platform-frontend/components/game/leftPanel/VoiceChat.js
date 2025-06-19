import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { connectSocket } from '@/lib/gameSocket'
import {
  initLocalStream,
  createPeerConnection,
  getPeerConnections,
  setPeerConnection,
  removePeerConnection,
} from '@/lib/webrtc'
import styles from './VoiceChat.module.scss'

export default function VoiceChat({ user }) {
  const [isMuted, setIsMuted] = useState(true)
  const [remoteUsers, setRemoteUsers] = useState([])

  const localStreamRef = useRef(null)
  const socketRef = useRef(null)
  const audioElementsRef = useRef({})
  const router = useRouter()
  const campaignId = router.query.id

  const syncMicState = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks?.()[0]
    if (track) setIsMuted(!track.enabled)
  }, [])

  const handleRemoteStream = useCallback((stream, id) => {
    const audio = new Audio()
    audio.srcObject = stream
    audio.autoplay = true
    audio.playsInline = true
    audio.muted = false
    audio.volume = 1
    audio.style.display = 'none'

    audio.play().catch(err => {
      console.warn(`⚠️ Автовідтворення заблоковано для ${id}:`, err)
    })

    document.body.appendChild(audio)
    audioElementsRef.current[id] = audio
  }, [])

  const cleanupAll = () => {
    Object.values(getPeerConnections()).forEach(pc => {
      try { pc.close() } catch (_) {}
    })
    Object.keys(getPeerConnections()).forEach(id => removePeerConnection(id))
    Object.values(audioElementsRef.current).forEach(audio => audio.remove())
    audioElementsRef.current = {}

    localStreamRef.current?.getTracks().forEach(track => track.stop())
    localStreamRef.current = null

    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
  }

  const setupVoice = useCallback(async () => {
    if (!user || !campaignId) return
    cleanupAll()

    const socket = connectSocket()
    socketRef.current = socket

    socket.on('connect', async () => {
      const stream = await initLocalStream().catch(err => {
        console.error('❌ Мікрофон недоступний:', err)
        return null
      })
      if (!stream) return
      localStreamRef.current = stream

      const track = stream.getAudioTracks()[0]
      track.enabled = false
      syncMicState()

      socket.emit('joinVoice', {
        campaignId,
        user: {
          id: user.id,
          nickname: user.nickname,
          username: user.username,
          avatar: user.avatar,
        },
      })

      setTimeout(() => {
        socket.emit('getRoomUsers', campaignId)
      }, 300)

      socket.on('roomUsers', async (users) => {
        for (const { id, user: remoteUser } of users) {
          if (id === socket.id || getPeerConnections()[id]) continue
          const pc = createPeerConnection(socket, id, stream => handleRemoteStream(stream, id), stream)
          setPeerConnection(id, pc)
          const offer = await pc.createOffer()
          await pc.setLocalDescription(offer)
          socket.emit('offer', { target: id, sdp: offer })
          setRemoteUsers(prev => {
            if (prev.find(u => u.id === remoteUser.id)) return prev
            return [...prev, remoteUser]
          })
        }
      })

      socket.on('userConnected', async ({ id, user: remoteUser }) => {
        if (id === socket.id || getPeerConnections()[id]) return
        setRemoteUsers(prev => {
          if (prev.find(u => u.id === remoteUser.id)) return prev
          return [...prev, remoteUser]
        })

        if (socket.id > id) {
          const pc = createPeerConnection(socket, id, stream => handleRemoteStream(stream, id), localStreamRef.current)
          setPeerConnection(id, pc)
          const offer = await pc.createOffer()
          await pc.setLocalDescription(offer)
          socket.emit('offer', { target: id, sdp: offer })
        }
      })

      socket.on('offer', async ({ from, sdp }) => {
        let pc = getPeerConnections()[from]
        if (!pc) {
          pc = createPeerConnection(socket, from, stream => handleRemoteStream(stream, from), localStreamRef.current)
          setPeerConnection(from, pc)
        }
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp))
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          socket.emit('answer', { target: from, sdp: answer })
        } catch (err) {
          console.warn(`⚠️ offer error:`, err.message)
        }
      })

      socket.on('answer', async ({ from, sdp }) => {
        const pc = getPeerConnections()[from]
        if (!pc) return
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp))
        } catch (err) {
          console.warn(`⚠️ answer error:`, err.message)
        }
      })

      socket.on('ice-candidate', async ({ from, candidate }) => {
        const pc = getPeerConnections()[from]
        if (pc && candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate))
          } catch (err) {
            console.warn(`⚠️ ICE error:`, err)
          }
        }
      })

      socket.on('userDisconnected', ({ id }) => {
        removePeerConnection(id)
        audioElementsRef.current[id]?.remove()
        delete audioElementsRef.current[id]
        setRemoteUsers(prev => prev.filter(u => u.socketId !== id && u.id !== id))
      })
    })
  }, [campaignId, user, handleRemoteStream, syncMicState])

  useEffect(() => {
    if (!campaignId || !user) return
    setupVoice()
    return cleanupAll
  }, [campaignId, user, setupVoice])

  return (
    <div className={styles.voice}>
      <div className={styles.title}>Войс чат</div>

      <ul className={styles.avatarList}>
        <li className={styles.avatarItem}>
          <div className={styles.avatarBox}>
            {user?.avatar ? (
              <Image src={user.avatar} alt="me" width={48} height={48} className={styles.avatarImg} />
            ) : (
              <span className={styles.avatarInitial}>{(user.nickname || user.username || 'Я')[0]}</span>
            )}
          </div>
        </li>

        {remoteUsers.map((remote) => (
          <li key={remote.id} className={styles.avatarItem}>
            <div className={styles.avatarBox}>
              {remote.avatar ? (
                <Image src={remote.avatar} alt={remote.username} width={48} height={48} className={styles.avatarImg} />
              ) : (
                <span className={styles.avatarInitial}>{(remote.nickname || remote.username || '?')[0]}</span>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className={styles.controls}>
        <button
          onClick={() => {
            const track = localStreamRef.current?.getAudioTracks?.()[0]
            if (!track) return
            track.enabled = !track.enabled
            setIsMuted(!track.enabled)
          }}
          className={`${styles.btn} ${isMuted ? styles.inactive : styles.active}`}
          title="Мікрофон"
        >
          {isMuted ? '🔇' : '🎤'}
        </button>
      </div>
    </div>
  )
}
