import { useEffect, useState } from 'react'
import withAuth from '@/lib/withAuth'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import ProfileInfo from '@/components/ProfileInfo'
import CampaignCard from '@/components/CampaignCard'
import { useRouter } from 'next/router'
import campaignStyles from '@/styles/pages/CampaignsPage.module.scss' // загальні стилі кампаній
import profileStyles from '@/styles/pages/ProfilePage.module.scss'     // стилі профілю

function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()

  const [dmCampaigns, setDmCampaigns] = useState([])
  const [playerCampaigns, setPlayerCampaigns] = useState([])

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await api.get('/users/me/campaigns')
        const all = res.data || []
        const dm = []
        const players = []

        all.forEach((campaign) => {
          if (campaign.owner?.id === user.id) {
            dm.push(campaign)
          } else {
            players.push(campaign)
          }
        })

        setDmCampaigns(dm)
        setPlayerCampaigns(players)
      } catch (err) {
        console.error("Не вдалося завантажити кампанії користувача")
      }
    }

    if (user) fetchCampaigns()
  }, [user])

  const handleCardClick = (campaignId) => {
    router.push(`/campaigns?campaignId=${campaignId}`)
  }

  const renderCampaignSection = (title, campaigns) => {
    if (campaigns.length === 0) return null

    return (
      <>
        <div className={profileStyles.divider} />
        <h2 className={campaignStyles.subtitle}>{title}</h2>
        <div className={campaignStyles.grid}>
          {campaigns.map((campaign) => (
            <div key={campaign.id} className={campaignStyles.cardWrapper}>
              <CampaignCard
                campaign={{
                  ...campaign,
                  playersCount: campaign.players?.length ?? 0,
                  dmName: campaign.owner?.nickname || campaign.owner?.username || 'DM',
                }}
                onClick={() => handleCardClick(campaign.id)}
              />
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <div className={profileStyles.page}>
      <h1 className={profileStyles.title}>Профіль</h1>
      <ProfileInfo user={user} />
      {renderCampaignSection("Кампанії, які ви ведете (DM)", dmCampaigns)}
      {renderCampaignSection("Кампанії, в яких ви граєте", playerCampaigns)}
    </div>
  )
}

export default withAuth(ProfilePage)
