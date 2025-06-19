import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import { connectSocket } from '@/lib/gameSocket'
import styles from './GamePageLayout.module.scss'

export default function HeaderBar({ campaign }) {
  const router = useRouter()
  const socketRef = useRef(null)

  useEffect(() => {
    // Ініціалізуємо сокет один раз
    socketRef.current = connectSocket()
  }, [])

  const handleExit = () => {
    if (campaign?.id && socketRef.current) {
      socketRef.current.emit('leaveVoice', campaign.id)
      socketRef.current.emit('leaveChat', campaign.id)
    }
    router.push('/campaigns')
  }

  return (
    <div className={styles.header}>
      <button className={styles.exit} onClick={handleExit}>Вийти</button>
      <h1 className={styles.title}>{campaign?.name || 'Без назви'}</h1>
    </div>
  )
}
