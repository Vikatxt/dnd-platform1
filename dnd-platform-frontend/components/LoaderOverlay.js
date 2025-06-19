import styles from '@/styles/components/LoaderOverlay.module.scss'

export default function LoaderOverlay() {
  return (
    <div className={styles.overlay}>
      <div className={styles.spinner}>
        <div className={styles.ring}></div>
        <div className={styles.text}>Завантаження...</div>
      </div>
    </div>
  )
}
