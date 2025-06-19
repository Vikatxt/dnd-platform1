import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import styles from '@/styles/pages/CreateCharacter.module.scss'
import { FaDiceD20 } from 'react-icons/fa'
import classData from '@/lib/data/classData'
import raceData from '@/lib/data/raceData'
import backgroundData from '@/lib/data/backgroundData'

const races = Object.keys(raceData)
const classes = Object.keys(classData)
const backgrounds = Object.keys(backgroundData)
const statsList = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']
const skillsList = [
  'Атлетика', 'Акробатика', 'Обман', 'Виступ', 'Історія', 'Магія', 'Медицина', 'Проникливість',
  'Природа', 'Релігія', 'Спритність рук', 'Стелс', 'Переконання', 'Аналіз', 'Виживання', 'Залякування', 'Переховування', 'Догляд за тваринами'
]
const languagesList = ['Загальна', 'Ельфійська', 'Гномʼяча', 'Орча', 'Драконяча', 'Тіфлінгська', 'Підземна']

export default function CreateCharacterPage() {
  const router = useRouter()
  const { id: campaignId } = router.query
  const { user } = useAuth()

  const [name, setName] = useState('')
  const [race, setRace] = useState(races[0])
  const [charClass, setCharClass] = useState(classes[0])
  const [background, setBackground] = useState(backgrounds[0])
  const [level, setLevel] = useState(1)
  const [stats, setStats] = useState({})
  const [rolled, setRolled] = useState(false)
  const [skills, setSkills] = useState([])
  const [languages, setLanguages] = useState([])
  const [alignment, setAlignment] = useState('')
  const [maxHP, setMaxHP] = useState('')
  const [armorClass, setArmorClass] = useState('')
  const [speed, setSpeed] = useState('')
  const [traits, setTraits] = useState('')
  const [ideals, setIdeals] = useState('')
  const [bonds, setBonds] = useState('')
  const [flaws, setFlaws] = useState('')
  const [equipment, setEquipment] = useState('')
  const [proficiencies, setProficiencies] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState('')
  const [alreadyExists, setAlreadyExists] = useState(false)

  const saves = classData[charClass].savingThrows
  const keyStat = classData[charClass].keyStat
  const raceLangs = raceData[race]?.languages || []
  const bonusLangs = backgroundData[background]?.languages || 0
  const fixedSkills = backgroundData[background]?.skills || []

  const rollStat = () => [...Array(4)].map(() => Math.floor(Math.random() * 6 + 1)).sort((a, b) => b - a).slice(0, 3).reduce((a, b) => a + b, 0)
  const rollAllStats = () => {
    const rolledStats = {}
    statsList.forEach(stat => rolledStats[stat] = rollStat())
    setStats(rolledStats)
    setRolled(true)
  }
  const getModifier = score => Math.floor((score - 10) / 2)
  const passivePerception = 10 + getModifier(stats.WIS || 10)

  const handleCheckbox = (value, list, setter, max = null, fixed = []) => {
    if (fixed.includes(value)) return
    const newList = list.includes(value) ? list.filter(v => v !== value) : [...list, value]
    if (max && newList.length > max) return
    setter(newList)
  }

  useEffect(() => {
    const checkExisting = async () => {
      try {
        const res = await api.get(`/characters/by-user?campaignId=${campaignId}`)
        if (Array.isArray(res.data) && res.data.length > 0) {
          setAlreadyExists(true)
        }
      } catch (err) {
        console.error('Помилка перевірки персонажа:', err)
      }
    }
    if (campaignId && user) checkExisting()
  }, [campaignId, user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rolled) return setError('Спочатку згенеруй характеристики!')
    if (!name) return setError('Введи ім’я персонажа')
    if (languages.length !== bonusLangs) return setError(`Оберіть ${bonusLangs} додаткових мов`)
    if (skills.length !== 0) return setError('Навички задаються автоматично фоном')

    const totalLangs = [...new Set([...raceLangs, ...languages])]

    try {
      const details = {
        alignment, background, maxHP, AC: armorClass, speed,
        traits, ideals, bonds, flaws, equipment,
        saves, skills: fixedSkills, languages: totalLangs,
        proficiencyBonus: level <= 4 ? 2 : level <= 8 ? 3 : level <= 12 ? 4 : level <= 16 ? 5 : 6,
        passivePerception, initiative: getModifier(stats.DEX || 10),
        proficiencies: proficiencies.split(',').map(s => s.trim()),
        imageUrl
      }
      await api.post('/characters', { name, class: charClass, race, level, stats, campaignId, details })
      router.push(`/campaigns/${campaignId}/game`)
    } catch {
      setError('Помилка створення персонажа')
    }
  }

  if (!campaignId || !user) return <div className={styles.page}><p>Завантаження...</p></div>
  if (alreadyExists) return <div className={styles.page}><p>У тебе вже є персонаж у цій кампанії.</p></div>

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Створення персонажа</h1>
      <form className={styles.sheet} onSubmit={handleSubmit}>
        {/* Ліва колонка */}
        <div className={styles.column}>
          <div className={styles.checkboxGroup}>
            <strong>Навички (з фону):</strong>
            {skillsList.map(skill => (
              <label key={skill}>
                <input type="checkbox" checked={fixedSkills.includes(skill)} disabled />
                {skill}
              </label>
            ))}
          </div>
          <div className={styles.checkboxGroup}>
            <strong>Мови (обери {bonusLangs}):</strong>
            {languagesList.map(lang => (
              <label key={lang}>
                <input
                  type="checkbox"
                  checked={languages.includes(lang)}
                  onChange={() => handleCheckbox(lang, languages, setLanguages, bonusLangs)}
                  disabled={raceLangs.includes(lang)}
                />
                {lang}
              </label>
            ))}
          </div>
        </div>

        {/* Центральна колонка */}
        <div className={styles.column}>
          <input className={styles.field} placeholder="Ім’я" value={name} onChange={e => setName(e.target.value)} />
          <input className={styles.field} placeholder="URL зображення" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
          {rolled && (
            <div className={styles.stats}>
              {statsList.map(stat => (
                <div key={stat} className={styles.statItem} style={{ borderColor: stat === keyStat ? '#6eb7ff' : undefined }}>
                  <strong>{stat}</strong>
                  <div>{stats[stat]}</div>
                  <div>({getModifier(stats[stat]) >= 0 ? '+' : ''}{getModifier(stats[stat])})</div>
                </div>
              ))}
            </div>
          )}
          <button type="button" onClick={rollAllStats} disabled={rolled} className={styles.diceButton}>
            <FaDiceD20 /> Згенерувати характеристики
          </button>
          <select className={styles.field} value={race} onChange={e => setRace(e.target.value)}>{races.map(r => <option key={r}>{r}</option>)}</select>
          <select className={styles.field} value={charClass} onChange={e => setCharClass(e.target.value)}>{classes.map(c => <option key={c}>{c}</option>)}</select>
          <input className={styles.field} type="number" min={1} max={20} value={level} onChange={e => setLevel(+e.target.value)} />
          <select className={styles.field} value={background} onChange={e => setBackground(e.target.value)}>{backgrounds.map(bg => <option key={bg}>{bg}</option>)}</select>
          <input className={styles.field} placeholder="Світогляд" value={alignment} onChange={e => setAlignment(e.target.value)} />
          <button type="submit" className={styles.submitButton}>Створити персонажа</button>
        </div>

        {/* Права колонка */}
        <div className={styles.column}>
          <textarea className={styles.field} placeholder="Риси характеру" value={traits} onChange={e => setTraits(e.target.value)} />
          <textarea className={styles.field} placeholder="Ідеали" value={ideals} onChange={e => setIdeals(e.target.value)} />
          <textarea className={styles.field} placeholder="Прив’язаності" value={bonds} onChange={e => setBonds(e.target.value)} />
          <textarea className={styles.field} placeholder="Недоліки" value={flaws} onChange={e => setFlaws(e.target.value)} />
          <textarea className={styles.field} placeholder="Спорядження" value={equipment} onChange={e => setEquipment(e.target.value)} />
          <input className={styles.field} placeholder="HP" type="number" value={maxHP} onChange={e => setMaxHP(e.target.value)} />
          <input className={styles.field} placeholder="AC" type="number" value={armorClass} onChange={e => setArmorClass(e.target.value)} />
          <input className={styles.field} placeholder="Швидкість" type="number" value={speed} onChange={e => setSpeed(e.target.value)} />
          <input className={`${styles.field} ${styles.readonly}`} disabled value={`Ініціатива: ${getModifier(stats.DEX || 10)}`} />
          <input className={`${styles.field} ${styles.readonly}`} disabled value={`Passive Perception: ${passivePerception}`} />
          <textarea className={styles.field} placeholder="Володіння (через кому)" value={proficiencies} onChange={e => setProficiencies(e.target.value)} />
        </div>
      </form>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
