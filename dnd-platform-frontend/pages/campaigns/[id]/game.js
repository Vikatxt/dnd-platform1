import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import GamePageLayout from '@/components/game/layout/GamePageLayout'

export default function GamePage() {
  const router = useRouter()
  const { id: campaignId } = router.query
  const { user, loading: authLoading } = useAuth()

  const [loading, setLoading] = useState(true)
  const [gameData, setGameData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!campaignId) return

    const fetchGameData = async () => {
      try {
        const response = await api.get(`/api/game/${campaignId}`)
        setGameData(response.data)
      } catch (err) {
        console.error('❌ Помилка завантаження гри:', err)
        setError('Не вдалося завантажити дані гри')
      } finally {
        setLoading(false)
      }
    }

    fetchGameData()
  }, [campaignId])

  if (loading || authLoading) return <div>Завантаження гри...</div>
  if (error) return <div className="error">{error}</div>
  if (!gameData || !user) return null

  return (
    <GamePageLayout
      campaign={gameData.campaign}
      players={gameData.players}
      characters={gameData.characters}
      messages={gameData.messages}
      map={gameData.map}
      fogTiles={gameData.map?.fogTiles || []}
      npcs={gameData.map?.npcs || []}
      user={user}
    />
  )
}

GamePage.hideHeader = true
