import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import api from '@/lib/api'
import styles from './InventoryPanel.module.scss'

import {
  HiOutlineBolt,
  HiOutlineShieldCheck,
  HiOutlineCube,
  HiOutlineBanknotes
} from 'react-icons/hi2'

export default function InventoryPanel() {
  const [inventory, setInventory] = useState([])
  const [weapons, setWeapons] = useState([])
  const [armor, setArmor] = useState([])
  const [currency, setCurrency] = useState({})
  const router = useRouter()
  const campaignId = router.query.id

  useEffect(() => {
    if (!campaignId) return

    api.get(`/characters/me/${campaignId}`).then(res => {
      const details = res.data.details || {}
      setWeapons(details.weapons || [])
      setArmor(details.armor || [])
      setInventory(details.inventory || [])
      setCurrency(details.currency || {})
    }).catch(err => {
      console.error('Помилка завантаження інвентаря:', err)
    })
  }, [campaignId])

  return (
    <div className={styles.panel}>
      <div className={styles.title}>Інвентар</div>

      {weapons.length > 0 && (
        <div className={styles.block}>
          <h3><HiOutlineBolt /> Зброя</h3>
          <table className={styles.table}>
            <thead>
              <tr><th>Назва</th><th>Бонус</th><th>Урон</th></tr>
            </thead>
            <tbody>
              {weapons.map((w, i) => (
                <tr key={i}>
                  <td>{w.name}</td>
                  <td>+{w.bonus}</td>
                  <td>{w.damage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {armor.length > 0 && (
        <div className={styles.block}>
          <h3><HiOutlineShieldCheck /> Броня</h3>
          <ul>
            {armor.map((a, i) => (
              <li key={i}>{a.name} — {a.description}</li>
            ))}
          </ul>
        </div>
      )}

      {inventory.length > 0 && (
        <div className={styles.block}>
          <h3><HiOutlineCube /> Речі</h3>
          <ul>
            {inventory.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.currency}>
        <h3><HiOutlineBanknotes /> Валюта</h3>
        <div className={styles.coins}>
          <div className={styles.coin}><strong>{currency.gp ?? 0}</strong><span>gp</span></div>
          <div className={styles.coin}><strong>{currency.sp ?? 0}</strong><span>sp</span></div>
          <div className={styles.coin}><strong>{currency.cp ?? 0}</strong><span>cp</span></div>
        </div>
      </div>
    </div>
  )
}
