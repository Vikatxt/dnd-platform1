import { useEffect, useState } from 'react'
import api from '@/lib/api'
import styles from './CampaignPanel.module.scss'

export default function CampaignPanel({ campaignId }) {
  const [npcs, setNpcs] = useState([])
  const [characters, setCharacters] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [npcRes, charRes] = await Promise.all([
          api.get(`/npc/campaign/${campaignId}`),
          api.get(`/characters/campaign/${campaignId}`)
        ])
        setNpcs(npcRes.data)
        setCharacters(charRes.data)
      } catch (err) {
        console.error('❌ Не вдалося завантажити NPC або персонажів:', err)
      }
    }

    if (campaignId) fetchData()
  }, [campaignId])

  return (
    <div className={styles.campaignPanel}>
      <h3>🎭 Персонажі</h3>
      <ul>
        {characters.map(c => (
          <li key={c.id}>{c.name} — {c.class}</li>
        ))}
      </ul>

      <h3>👾 NPC</h3>
      <ul>
        {npcs.map(n => (
          <li key={n.id}>{n.name}</li>
        ))}
      </ul>
    </div>
  )
}
