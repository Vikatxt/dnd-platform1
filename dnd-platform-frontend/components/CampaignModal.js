import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import styles from '@/styles/components/CampaignModal.module.scss'
import CharacterChoiceModal from './CharacterChoiceModal'
import ConfirmCreateModal from './ConfirmCreateModal'
import api from '@/lib/api'

export default function CampaignModal({ campaign, onClose, isMember, currentUser }) {
  const router = useRouter()
  const [showCharacterChoice, setShowCharacterChoice] = useState(false)
  const [showCreateConfirm, setShowCreateConfirm] = useState(false)
  const [userCharacters, setUserCharacters] = useState([])

  const {
    id,
    name,
    avatar,
    owner,
    isPublic,
    createdAt,
    difficulty,
    players,
    maxPlayers,
    startLevel,
    allowMulticlass,
    useHomebrew,
    mapGridSize,
    description
  } = campaign || {}

  const isDM = currentUser?.id && owner?.id && currentUser.id === owner.id
  const playerCount = Array.isArray(players) ? players.length : 0

  const difficultyMap = {
    EASY: 'Легка',
    NORMAL: 'Середня',
    HARD: 'Складна',
    INSANE: 'Божевільна'
  }

  const formatDate = (iso) => {
    const date = new Date(iso)
    return date.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const booleanText = (val) => (val ? 'Так' : 'Ні')

  const handleJoin = async () => {
    try {
      console.log('🔎 Перевірка персонажів користувача в кампанії ID:', id)
      const res = await api.get(`/characters/campaign/${id}/user`)
      const characters = res.data
      console.log('✅ Отримано персонажів:', characters)

      if (characters.length > 0) {
        setUserCharacters(characters)
        setShowCharacterChoice(true)
      } else {
        setShowCreateConfirm(true)
      }
    } catch (err) {
      console.error('❌ Помилка перевірки персонажів:', err)
    }
  }

  useEffect(() => {
    if (!campaign) return

    console.log('📦 CampaignModal змонтовано')
    console.log('🆔 campaignId:', campaign.id)
    console.log('👤 currentUser:', currentUser)
    console.log('📋 Повна кампанія:', campaign)
  }, [campaign, currentUser])

  if (!campaign) {
    console.warn('⚠️ CampaignModal: Кампанія не передана')
    return null
  }

  return (
    <>
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <button className={styles.closeButton} onClick={onClose}>✖</button>

          <div className={styles.left}>
            <div className={styles.avatarWrapper}>
              <img src={avatar} alt="Аватар кампанії" />
            </div>

            <div className={styles.joinWrapper}>
              {isDM ? (
                <button className={styles.button} onClick={() => router.push(`/campaigns/${id}/settings`)}>
                  Налаштування
                </button>
              ) : isMember ? (
                <button className={styles.button} onClick={handleJoin}>
                  Увійти до гри
                </button>
              ) : isPublic ? (
                <button className={styles.button} onClick={handleJoin}>
                  Приєднатися
                </button>
              ) : (
                <button className={styles.button} disabled>
                  Приватна кампанія
                </button>
              )}
            </div>
          </div>

          <div className={styles.right}>
            <h2 className={styles.title}>{name}</h2>
            <div className={styles.details}>
              <p><strong>DM:</strong> {owner?.nickname || owner?.username || '—'}</p>
              <p><strong>Тип:</strong> {isPublic ? 'Публічна' : 'Приватна'}</p>
              <p><strong>Створено:</strong> {formatDate(createdAt)}</p>
              <p><strong>Складність:</strong> {difficultyMap[difficulty] || difficulty}</p>
              <p><strong>Гравців:</strong> {playerCount} / {maxPlayers}</p>
              <p><strong>Стартовий рівень:</strong> {startLevel}</p>
              <p><strong>Мультиклас:</strong> {booleanText(allowMulticlass)}</p>
              <p><strong>Homebrew:</strong> {booleanText(useHomebrew)}</p>
              <p><strong>Сітка мапи:</strong> {mapGridSize}px</p>
            </div>

            {description && (
              <>
                <div className={styles.divider}>ОПИС</div>
                <div className={styles.description}>{description}</div>
              </>
            )}
          </div>
        </div>
      </div>

      {showCharacterChoice && (
        <CharacterChoiceModal
          characters={userCharacters}
          onChoose={(characterId) => {
            console.log('🎮 Обрано персонажа:', characterId)
            router.push(`/campaigns/${id}/game?character=${characterId}`)
          }}
          onCreateNew={() => {
            console.log('➕ Створення нового персонажа')
            router.push(`/campaigns/${id}/create-character`)
          }}
          onClose={() => setShowCharacterChoice(false)}
        />
      )}

      {showCreateConfirm && (
        <ConfirmCreateModal
          onConfirm={() => {
            console.log('✅ Підтверджено створення персонажа')
            router.push(`/campaigns/${id}/create-character`)
          }}
          onClose={() => setShowCreateConfirm(false)}
        />
      )}
    </>
  )
}
