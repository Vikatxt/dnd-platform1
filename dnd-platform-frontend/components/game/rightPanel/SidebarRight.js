import { useState, useEffect } from 'react'
import TabsPanel from './TabsPanel'
import CharacterPanel from './CharacterPanel'
import InventoryPanel from './InventoryPanel'
import SkillsPanel from './SkillsPanel'
import CampaignPanel from './CampaignPanel'
import NPCSettings from '@/components/dm-settings/NPCSettings'

import styles from './SidebarRight.module.scss'

export default function SidebarRight({
  campaignId,
  isDM,
  onSelectCharacter,
  onSelectNpc,
  fogMode,
  setFogMode,
}) {
  const [activeTab, setActiveTab] = useState(null)
  const [npcVersion, setNpcVersion] = useState(0)
  const [selectedCharacter, setSelectedCharacter] = useState(null)

  useEffect(() => {
    console.log('🎭 [SidebarRight] isDM:', isDM, '| campaignId:', campaignId)
    setActiveTab(isDM ? 'campaign' : 'character')
  }, [isDM, campaignId])

  const handleTabChange = (key) => {
    console.log('🔁 [SidebarRight] Зміна вкладки:', key)
    setActiveTab(key)
  }

  const renderTabContent = () => {
    console.log('📦 [SidebarRight] renderTabContent — activeTab:', activeTab)

    if (isDM) {
      switch (activeTab) {
        case 'campaign':
          return (
            <div className={styles.panelBlock}>
              <CampaignPanel
                campaignId={campaignId}
                onSelectCharacter={onSelectCharacter}
                onSelectNpc={onSelectNpc}
                fogMode={fogMode}
                setFogMode={setFogMode}
              />
            </div>
          )
        case 'createNpc':
          return (
            <div className={styles.panelBlock}>
              <NPCSettings
                campaignId={campaignId}
                onCreated={() => {
                  console.log('🧙‍♂️ [SidebarRight] NPC створено — оновлюємо список')
                  setNpcVersion((prev) => prev + 1)
                }}
              />
            </div>
          )
        default:
          return <p className={styles.panelBlock}>🔸 Невідома вкладка для ДМа</p>
      }
    }

    switch (activeTab) {
      case 'character':
        return (
          <div className={styles.panelBlock}>
            <CharacterPanel
              campaignId={campaignId}
              characterId={selectedCharacter?.id}
            />
          </div>
        )
      case 'inventory':
        return (
          <div className={styles.panelBlock}>
            <InventoryPanel />
          </div>
        )
      case 'skills':
        return (
          <div className={styles.panelBlock}>
            <SkillsPanel />
          </div>
        )
      default:
        return <p className={styles.panelBlock}>🔸 Невідома вкладка для гравця</p>
    }
  }

  return (
    <div className={styles.sidebar}>
      <TabsPanel activeTab={activeTab} onTabChange={handleTabChange} isDM={isDM} />
      <div className={styles.panelContainer}>
        {renderTabContent()}
      </div>
    </div>
  )
}
