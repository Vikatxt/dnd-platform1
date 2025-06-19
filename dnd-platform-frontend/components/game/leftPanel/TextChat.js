import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { connectSocket } from '@/lib/gameSocket'
import styles from './TextChat.module.scss'

const API = process.env.NEXT_PUBLIC_API_URL

export default function TextChat({ user }) {
  const router = useRouter()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [messages])

  useEffect(() => {
    if (!router.isReady || !user) return
    const campaignId = router.query.id
    if (!campaignId) return

    const socket = connectSocket()

    socket.on('connect', () => {
      console.log('🔄 Socket connected:', socket.id)
    })

    socket.on('newMessage', (msg) => {
      if (!msg?.id) return
      setMessages((prev) => [...prev, msg])
    })

    socket.emit('joinChat', campaignId)

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${API}/chat/${campaignId}`, {
          withCredentials: true,
        })
        setMessages(res.data)
      } catch (err) {
        console.error('❌ Error fetching messages:', err)
      }
    }

    fetchMessages()

    return () => {
      socket.emit('leaveChat', campaignId)
      socket.off('newMessage')
    }
  }, [router.isReady, router.query.id, user])

  const handleSend = async () => {
    const trimmed = newMessage.trim()
    if (!trimmed) return

    try {
      await axios.post(
        `${API}/chat`,
        {
          campaignId: router.query.id,
          content: trimmed,
        },
        { withCredentials: true }
      )
      setNewMessage('')
    } catch (err) {
      console.error('❌ Error sending message:', err)
    }
  }

  return (
    <div className={styles.chat}>
      <div className={styles.title}>Текстовий чат</div>

      <div className={styles.messages}>
        {messages.length === 0 ? (
          <div className={styles.noMessages}>Повідомлень поки немає.</div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={`${msg.id}-${msg.createdAt}-${index}`}
              className={styles.message}
            >
              <div className={styles.meta}>
                <span className={styles.author}>
                  {msg.sender?.nickname || msg.sender?.username || 'Гравець'}
                </span>
                <span className={styles.time}>
                  {msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString()
                    : '—'}
                </span>
              </div>
              <div className={styles.content}>
                {msg.content || '[пусте повідомлення]'}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Введіть щось..."
          rows={1}
        />
        <button onClick={handleSend} className={styles.sendButton} aria-label="Надіслати">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path fill="#d9eaff" d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2 .01 7z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
