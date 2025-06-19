import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import withAuth from '@/lib/withAuth'
import { useAuth } from '@/context/AuthContext'
import { getCampaigns } from '@/lib/campaign'
import api from '@/lib/api'
import CampaignCard from '@/components/CampaignCard'
import CreateCampaignModal from '@/components/CreateCampaignModal'
import CampaignModal from '@/components/CampaignModal'
import styles from '@/styles/pages/CampaignsPage.module.scss'

function CampaignsPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const [search, setSearch] = useState("")
  const [sortByDate, setSortByDate] = useState("desc")
  const [filterByPlayers, setFilterByPlayers] = useState("")
  const [customPlayers, setCustomPlayers] = useState("")
  const [visibilityFilter, setVisibilityFilter] = useState("any")

  const [activeCampaign, setActiveCampaign] = useState(null)
  const [isMember, setIsMember] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        const playerCountLte =
          filterByPlayers === 'custom'
            ? parseInt(customPlayers)
            : filterByPlayers
              ? parseInt(filterByPlayers)
              : undefined

        const params = {
          search,
          sortBy: 'createdAt',
          sortOrder: sortByDate,
          isPublic:
            visibilityFilter === 'public'
              ? 'true'
              : visibilityFilter === 'private'
              ? 'false'
              : undefined,
          playerCountLte
        }

        const data = await getCampaigns(params)
        setCampaigns(data)

        const campaignIdFromQuery = router.query.campaignId
        if (campaignIdFromQuery) {
          const found = data.find(c => c.id.toString() === campaignIdFromQuery.toString())
          if (found) {
            const currentPlayer = Array.isArray(found.players)
              ? found.players.find(p => p.playerId === user.id)
              : null

            setIsMember(!!currentPlayer)
            setActiveCampaign(found)
          }
        }
      } catch (err) {
        console.error('Помилка завантаження кампаній:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, search, sortByDate, filterByPlayers, customPlayers, visibilityFilter, router.query])

  const handleCampaignCreated = (newCampaign) => {
    setCampaigns(prev => [...prev, newCampaign])
    setIsMember(true)
    setActiveCampaign(newCampaign)
    setShowModal(false)
    router.replace(`/campaigns?campaignId=${newCampaign.id}`, undefined, { shallow: true })
  }

  const handleCardClick = (campaign) => {
    const currentPlayer = Array.isArray(campaign.players)
      ? campaign.players.find(p => p.playerId === user.id)
      : null

    setIsMember(!!currentPlayer)
    setActiveCampaign(campaign)
    router.replace(`/campaigns?campaignId=${campaign.id}`, undefined, { shallow: true })
  }

  const handleJoin = async (campaignId) => {
    try {
      await api.post(`/campaigns/${campaignId}/join`)
      setActiveCampaign(null)
      window.location.href = `/campaigns/${campaignId}/game`
    } catch (err) {
      console.error(err)
      alert('Не вдалося приєднатись до кампанії')
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Кампанії</h1>
      <p className={styles.subtitle}>Обери свою пригоду або створи нову</p>

      <div className={styles.actions}>
        <div className={styles.leftBlock}>
          <button className={styles.createButton} onClick={() => setShowModal(true)}>
            <span>Створити</span>
          </button>
        </div>

        <div className={styles.rightBlock}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Пошук кампаній..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className={styles.sortSelect}
            value={sortByDate}
            onChange={(e) => setSortByDate(e.target.value)}
          >
            <option value="desc">Новіші</option>
            <option value="asc">Старіші</option>
          </select>

          <select
            className={styles.sortSelect}
            value={filterByPlayers}
            onChange={(e) => setFilterByPlayers(e.target.value)}
          >
            <option value="">Будь-яка кількість</option>
            <option value="3">До 3</option>
            <option value="5">До 5</option>
            <option value="10">До 10</option>
            <option value="custom">Інше число...</option>
          </select>

          {filterByPlayers === "custom" && (
            <input
              type="number"
              className={`${styles.sortSelect} ${styles.noArrows}`}
              placeholder="максимум гравців"
              min={1}
              max={99}
              value={customPlayers}
              onChange={(e) => setCustomPlayers(e.target.value)}
            />
          )}

          <div className={styles.tripleToggle}>
            {['public', 'any', 'private'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setVisibilityFilter(type)}
                className={`${styles.toggleOption} ${visibilityFilter === type ? styles.active : ''}`}
              >
                {type === 'public' ? 'Публічні' : type === 'private' ? 'Приватні' : 'Будь-які'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <p className={styles.status}>Завантаження...</p>
      ) : campaigns.length === 0 ? (
        <p className={styles.status}>Нічого не знайдено</p>
      ) : (
        <div className={styles.grid}>
          {campaigns.map(campaign => (
            <div
              key={campaign.id}
              className={styles.cardWrapper}
              onClick={() => handleCardClick(campaign)}
            >
              <CampaignCard campaign={campaign} />
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CreateCampaignModal
          onClose={() => setShowModal(false)}
          onCreated={handleCampaignCreated}
        />
      )}

      {activeCampaign && (
        <CampaignModal
          campaign={activeCampaign}
          onClose={() => {
            setActiveCampaign(null)
            router.replace('/campaigns', undefined, { shallow: true }) // очищення query
          }}
          isMember={isMember}
          onJoin={handleJoin}
          currentUser={user}
        />
      )}
    </div>
  )
}

export default withAuth(CampaignsPage)
