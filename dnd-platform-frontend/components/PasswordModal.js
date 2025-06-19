import { useState } from 'react'
import styles from '@/styles/components/PasswordModal.module.scss'
import api from '@/lib/api'
import { validatePassword } from '@/utils/validators'

export default function PasswordModal({ onClose }) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validatePassword(newPassword)) {
      return setError("Новий пароль має містити мінімум 8 символів, включаючи букви та цифри")
    }

    if (newPassword !== confirmPassword) {
      return setError("Паролі не співпадають")
    }

    try {
      await api.post('/auth/change-password', {
        oldPassword,
        newPassword,
      })
      setSuccess('Пароль успішно змінено')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка при зміні пароля')
    }
  }

  return (
    <div className={`${styles.overlay} ${styles.active}`}>
      <div className={`${styles.modal} ${styles.active}`}>
        <button className={styles.close} onClick={onClose}>×</button>
        <div className={styles.content}>
          <h2>Зміна пароля</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Старий пароль"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Новий пароль"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Повторіть новий пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button type="submit" className={`${styles.secondaryButton} ${styles.wide}`}>
              <span>Змінити</span>
            </button>
          </form>

          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}
        </div>
      </div>
    </div>
  )
}
