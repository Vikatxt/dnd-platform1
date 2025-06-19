import api from './api'

export const getCampaigns = async (params = {}) => {
  const res = await api.get('/campaigns', { params })

  return res.data.map(c => ({
    id: c.id,
    name: c.name,
    description: c.description || '',
    avatar: c.avatar || 'https://via.placeholder.com/180x120',

    owner: c.owner || null,

    dmName: c.owner?.nickname || c.owner?.username || 'DM',

    storytellerName:
      c.players.find(p => !p.isDM)?.player?.nickname ||
      c.players.find(p => !p.isDM)?.player?.username ||
      '—',

    playersCount: c.players.length,
    maxPlayers: c.maxPlayers,

    isPublic: c.isPublic,
    difficulty: c.difficulty || 'NORMAL',
    allowMulticlass: c.allowMulticlass,
    useHomebrew: c.useHomebrew,

    createdAt: c.createdAt,
    startLevel: c.startLevel,
    mapGridSize: c.mapGridSize,
    players: c.players
  }))
}



// 🔹 Створення нової кампанії
export const createCampaign = async (data) => {
  const res = await api.post('/campaigns', data)
  return res.data
}
