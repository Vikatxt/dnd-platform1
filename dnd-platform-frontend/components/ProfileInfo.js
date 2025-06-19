import { useState } from 'react'
import { useRouter } from 'next/router'
import api from '@/lib/api'
import styles from '@/styles/components/ProfileInfo.module.scss'
import PasswordModal from './PasswordModal'

export default function ProfileInfo({ user }) {
  const router = useRouter()
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [formData, setFormData] = useState({
    username: user?.username || '',
    nickname: user?.nickname || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const [editing, setEditing] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSave = async () => {
    try {
      await api.put('/auth/update-profile', formData)
      setSuccess('Дані оновлено успішно')
      setEditing(false)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка оновлення профілю')
    }
  }

  const handleLogout = async () => {
    const confirm = window.confirm('Ви впевнені, що хочете вийти з акаунту?')
    if (!confirm) return

    try {
      await api.post('/auth/logout')
      router.push('/')
    } catch (err) {
      console.error('Помилка при виході', err)
    }
  }

  return (
    <div className={styles.profileInfo}>
      <div className={styles.overlay} />
      <div className={styles.infoContent}>
        <h2 className={styles.title}>Інформація профілю</h2>

        <div className={styles.formGrid}>
          {['username', 'nickname', 'email', 'phone'].map((field) => (
            <div key={field} className={styles.inputGroup}>
              <label htmlFor={field}>
                {{
                  username: 'Логін',
                  nickname: 'Нікнейм',
                  email: 'Email',
                  phone: 'Телефон',
                }[field]}
              </label>
              <input
                id={field}
                type="text"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                disabled={!editing}
                className={styles.input}
              />
            </div>
          ))}
        </div>

        <p><strong>Роль:</strong> {user?.role}</p>

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        <div className={styles.actions}>
          <div className={styles.leftButtons}>
            {editing ? (
              <button onClick={handleSave} className={styles.actionButton}>
                <span>Зберегти</span>
              </button>
            ) : (
              <button onClick={() => setEditing(true)} className={styles.actionButton}>
                <span>Редагувати</span>
              </button>
            )}
            <button onClick={() => setShowPasswordModal(true)} className={styles.actionButton}>
              <span>Змінити пароль</span>
            </button>
          </div>
          <div className={styles.rightButton}>
            <button onClick={handleLogout} className={styles.logoutButton}>
              <span>Вийти</span>
            </button>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <PasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  )
}
