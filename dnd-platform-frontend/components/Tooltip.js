import { useState } from 'react'
import styles from '@/styles/components/Tooltip.module.scss'

export default function Tooltip({ children, text }) {
  const [visible, setVisible] = useState(false)

  return (
    <div
      className={styles.wrapper}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && <div className={styles.tooltip}>{text}</div>}
    </div>
  )
}
