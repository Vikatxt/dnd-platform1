import { useState, useEffect } from 'react'
import styles from '@/styles/components/CreateCampaignModal.module.scss'
import { createCampaign } from '@/lib/campaign'

export default function CreateCampaignModal({ onClose, onCreated, show = true }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) setVisible(true)
    else {
      const timeout = setTimeout(() => setVisible(false), 300)
      return () => clearTimeout(timeout)
    }
  }, [show])

  const [form, setForm] = useState({
    name: '',
    avatar: '',
    description: '',
    isPublic: true,
    maxPlayers: 6,
    allowMulticlass: false,
    useHomebrew: false,
    mapGridSize: 5,
    difficulty: 'NORMAL',
    startLevel: 1
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await createCampaign(form)
      const newCampaign = response.campaign

      onClose()
      onCreated(newCampaign) // ✅ передаємо кампанію в CampaignsPage
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка створення')
    } finally {
      setLoading(false)
    }
  }

  if (!visible) return null

  return (
    <div className={`${styles.overlay} ${show ? styles.active : ''}`}>
      <div className={`${styles.modal} ${show ? styles.active : ''}`}>
        <h2 className={styles.title}>Створити нову кампанію</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            name="name"
            placeholder="Назва"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="avatar"
            placeholder="Посилання на зображення кампанії"
            value={form.avatar}
            onChange={handleChange}
          />
          <textarea
            name="description"
            placeholder="Опис"
            value={form.description}
            onChange={handleChange}
          />

          <div className={styles.formRow}>
            <div className={styles.leftColumn}>
              <label>
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={form.isPublic}
                  onChange={handleChange}
                />
                Публічна кампанія
              </label>

              <label>
                <input
                  type="checkbox"
                  name="allowMulticlass"
                  checked={form.allowMulticlass}
                  onChange={handleChange}
                />
                Дозволити мультиклас
              </label>

              <label>
                <input
                  type="checkbox"
                  name="useHomebrew"
                  checked={form.useHomebrew}
                  onChange={handleChange}
                />
                Дозволити homebrew
              </label>
            </div>

            <div className={styles.rightColumn}>
              <label>
                Максимум гравців:
                <input
                  type="number"
                  name="maxPlayers"
                  value={form.maxPlayers}
                  onChange={handleChange}
                  min="1"
                  max="10"
                />
              </label>

              <label>
                Початковий рівень:
                <input
                  type="number"
                  name="startLevel"
                  value={form.startLevel}
                  onChange={handleChange}
                  min="1"
                  max="20"
                />
              </label>

              <label>
                Розмір сітки:
                <input
                  type="number"
                  name="mapGridSize"
                  value={form.mapGridSize}
                  onChange={handleChange}
                  min="1"
                  max="100"
                />
              </label>

              <label>
                Складність:
                <select
                  name="difficulty"
                  value={form.difficulty}
                  onChange={handleChange}
                >
                  <option value="EASY">Легка</option>
                  <option value="NORMAL">Середня</option>
                  <option value="HARD">Складна</option>
                  <option value="INSANE">Божевільна</option>
                </select>
              </label>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.buttons}>
            <button type="submit" disabled={loading}>Створити</button>
            <button type="button" onClick={onClose}>Скасувати</button>
          </div>
        </form>
      </div>
    </div>
  )
}
