import { useState } from 'react'
import styles from './DiceRoller.module.scss'

const diceTypes = [4, 6, 8, 10, 12, 20, 100]

export default function DiceRoller() {
  const [rolling, setRolling] = useState(false)
  const [result, setResult] = useState(null)
  const [current, setCurrent] = useState('')

  const rollDice = (sides) => {
    if (rolling) return
    setRolling(true)
    setResult(null)

    let interval = setInterval(() => {
      setCurrent(Math.floor(Math.random() * sides) + 1)
    }, 80)

    setTimeout(() => {
      clearInterval(interval)
      const final = Math.floor(Math.random() * sides) + 1
      setCurrent(final)
      setResult(`🎲 d${sides} → ${final}`)
      setRolling(false)
    }, 1000)
  }

  return (
    <div className={styles.panel}>
      <div className={styles.title}>🎲 Кидок кубика</div>

      <div className={styles.diceRow}>
        {diceTypes.map((d) => (
          <button
            key={d}
            className={styles.diceBtn}
            onClick={() => rollDice(d)}
            disabled={rolling}
          >
            d{d}
          </button>
        ))}
      </div>

      <div className={styles.display}>
        {rolling ? <span className={styles.rolling}>{current}</span> : result && <span>{result}</span>}
      </div>
    </div>
  )
}
