import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import api from '@/lib/api'
import styles from './SkillsPanel.module.scss'

export default function SkillsPanel() {
  const [skills, setSkills] = useState([])
  const [lastRoll, setLastRoll] = useState(null)
  const router = useRouter()
  const campaignId = router.query.id

  useEffect(() => {
    if (!campaignId) return
    api.get(`/characters/me/${campaignId}`).then(res => {
      const details = res.data.details || {}
      setSkills(details.skills || [])
    }).catch(err => {
      console.error('Помилка завантаження навичок:', err)
    })
  }, [campaignId])

  const rollSkill = (skill) => {
    const roll = Math.floor(Math.random() * 20) + 1
    const total = roll + skill.bonus
    setLastRoll({ name: skill.name, roll, bonus: skill.bonus, total })
  }

  return (
    <div className={styles.panel}>
      <div className={styles.title}>Навички</div>

      {lastRoll && (
        <div className={styles.resultBox}>
          🎲 <strong>{lastRoll.name}</strong>: {lastRoll.roll} + {lastRoll.bonus} = <span className={styles.total}>{lastRoll.total}</span>
        </div>
      )}

      {skills.length === 0 ? (
        <p>Немає навичок</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Назва</th>
              <th>Бонус</th>
              <th>Кидок</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((s, i) => (
              <tr key={i}>
                <td title={s.description}>{s.name}</td>
                <td>+{s.bonus}</td>
                <td>
                  <button
                    className={styles.rollBtn}
                    onClick={() => rollSkill(s)}
                    title="Кинути d20"
                  >
                    🎲
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
