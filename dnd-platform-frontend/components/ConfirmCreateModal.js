import styles from '@/styles/components/CharacterChoiceModal.module.scss'

export default function ConfirmCreateModal({ onConfirm, onClose }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>✖</button>
        <h2 className={styles.title}>У вас ще немає персонажа</h2>
        <p className={styles.text}>Створіть персонажа, щоб приєднатися до гри.</p>
        <button className={styles.createBtn} onClick={onConfirm}>
          Створити персонажа
        </button>
      </div>
    </div>
  )
}
