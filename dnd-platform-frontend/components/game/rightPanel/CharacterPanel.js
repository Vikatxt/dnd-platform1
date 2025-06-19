import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import styles from './CharacterPanel.module.scss'

import {
  HiOutlineHeart,
  HiOutlineShieldCheck,
  HiOutlineArrowTrendingUp,
  HiOutlineIdentification
} from 'react-icons/hi2'

export default function CharacterPanel({ campaignId, characterId }) {
  const { user } = useAuth()
  const [character, setCharacter] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if ((!campaignId && !characterId) || !user) return

    const fetchCharacter = async () => {
      try {
        let res

        if (characterId) {
          res = await api.get(`/characters/by-id/${characterId}`)
        } else {
          res = await api.get(`/characters/me/${campaignId}`)
        }

        setCharacter(res.data)
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error('❌ Помилка завантаження персонажа:', err)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCharacter()
  }, [campaignId, characterId, user])

  if (loading) return <div className={styles.panel}>Завантаження…</div>
  if (!character) return <div className={styles.panel}>Персонаж не знайдений</div>

  const { name, class: charClass, race, level, stats = {}, details = {} } = character

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        {details.image && (
          <img src={details.image} alt="Портрет" className={styles.avatar} />
        )}
        <div className={styles.info}>
          <div className={styles.name}>{name}</div>
          <div className={styles.meta}>
            <HiOutlineIdentification />
            <span>{charClass} • {race} • Рівень {level}</span>
          </div>
        </div>
      </div>

      <div className={styles.statsBlock}>
        <div className={styles.statBig}>
          <HiOutlineHeart />
          <span>HP</span>
          <strong>{details.hp ?? '—'}</strong>
        </div>
        <div className={styles.statBig}>
          <HiOutlineShieldCheck />
          <span>AC</span>
          <strong>{details.ac ?? '—'}</strong>
        </div>
        <div className={styles.statBig}>
          <HiOutlineArrowTrendingUp />
          <span>Ініціатива</span>
          <strong>{details.initiative ?? '—'}</strong>
        </div>
      </div>

      {Object.keys(stats).length > 0 && (
        <div className={styles.abilities}>
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className={styles.abilityBox}>
              <div className={styles.abilityName}>{key}</div>
              <div className={styles.abilityValue}>{value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
