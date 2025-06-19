import styles from './TabsPanel.module.scss'
import {
  HiOutlineUser,
  HiOutlineBriefcase,
  HiOutlineSparkles,
  HiOutlineUsers
} from 'react-icons/hi2'

export default function TabsPanel({ activeTab, onTabChange, isDM }) {
  const tabs = isDM
    ? [
        { key: 'campaign', label: 'Кампанія', icon: <HiOutlineUsers /> },
        { key: 'createNpc', label: 'Створити NPC', icon: <HiOutlineSparkles /> },
      ]
    : [
        { key: 'character', label: 'Персонаж', icon: <HiOutlineUser /> },
        { key: 'inventory', label: 'Інвентар', icon: <HiOutlineBriefcase /> },
        { key: 'skills', label: 'Навички', icon: <HiOutlineSparkles /> },
      ]

  return (
    <div className={styles.tabs}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          className={`${styles.tab} ${activeTab === tab.key ? styles.active : ''}`}
          onClick={() => onTabChange(tab.key)}
        >
          <span className={styles.icon}>{tab.icon}</span>
          <span className={styles.label}>{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
