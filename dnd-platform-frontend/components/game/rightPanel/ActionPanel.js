import styles from './ActionPanel.module.scss'

export default function ActionPanel() {
  const rollDice = () => {
    const result = Math.floor(Math.random() * 20) + 1
    alert(`🎲 Кидок d20: ${result}`)
  }

  return (
    <div className={styles.panel}>
      <div className={styles.title}>Дії / Кидки</div>
      <button className={styles.diceBtn} onClick={rollDice}>
        🎲 Кинути d20
      </button>
    </div>
  )
}
