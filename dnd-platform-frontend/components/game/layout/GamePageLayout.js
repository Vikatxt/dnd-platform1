import { useState } from 'react'
import HeaderBar from './HeaderBar'
import SidebarLeft from '../leftPanel/SidebarLeft'
import SidebarRight from '../rightPanel/SidebarRight'
import MapArea from '../map/MapArea'
import DiceBoxPanel from '../dice/DiceRoller'

import styles from './GamePageLayout.module.scss'

export default function GamePageLayout({
  campaign,
  messages,
  user
}) {
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [selectedNpc, setSelectedNpc] = useState(null)
  const [fogMode, setFogMode] = useState('add')

  if (!campaign || !user) return <p>❗️ Кампанія або користувач не знайдені</p>

  // ⛑ Гарантуємо наявність ownerId
  const ownerId = campaign.ownerId || campaign.owner?.id

  // 🔍 ЛОГИ ДЛЯ ДІАГНОСТИКИ
  console.log('🧠 USER ID:', user?.id)
  console.log('📘 CAMPAIGN OBJECT:', campaign)
  console.log('📘 CAMPAIGN OWNER ID:', ownerId)
  console.log('🧪 isDM буде:', ownerId === user?.id)

  const isDM = ownerId === user.id

  const handlePlaced = () => {
    console.log('🟢 Об’єкт розміщено')
  }

  return (
    <div className={styles.wrapper}>
      <HeaderBar campaign={campaign} />

      <div className={styles.body}>
        <SidebarLeft
          messages={messages}
          user={user}
        />

        <div className={styles.mapSection}>
          <MapArea
            campaignId={campaign.id}
            isDM={isDM}
            selectedCharacter={selectedCharacter}
            selectedNpc={selectedNpc}
            onPlaced={handlePlaced}
            fogMode={fogMode}
          />
          <DiceBoxPanel />
        </div>

        <SidebarRight
          campaignId={campaign.id}
          isDM={isDM}
          onSelectCharacter={setSelectedCharacter}
          onSelectNpc={setSelectedNpc}
          fogMode={fogMode}
          setFogMode={setFogMode}
        />
      </div>
    </div>
  )
}
