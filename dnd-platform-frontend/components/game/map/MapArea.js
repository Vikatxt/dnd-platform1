import { useEffect, useRef, useState, useCallback } from 'react'
import api from '@/lib/api'
import useDragMove from '@/hooks/useDragMove'
import { useAuth } from '@/context/AuthContext'
import styles from './MapArea.module.scss'

export default function MapArea({
  campaignId,
  isDM,
  selectedCharacter,
  selectedNpc,
  onPlaced,
  fogMode
}) {
  const [map, setMap] = useState(null)
  const [positions, setPositions] = useState([])
  const [fogTiles, setFogTiles] = useState([])
  const [npcs, setNpcs] = useState([])
  const [isDrawingFog, setIsDrawingFog] = useState(false)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const containerRef = useRef(null)
  const isPanning = useRef(false)
  const startPan = useRef({ x: 0, y: 0 })
  const drawnTiles = useRef(new Set())
  const { user } = useAuth()
  const gridSize = 30

  const fetchData = useCallback(async () => {
    try {
      const mapRes = await api.get(`/maps/active?campaignId=${campaignId}`)
      const m = mapRes.data
      setMap(m)

      const [posRes, fogRes, npcRes] = await Promise.all([
        api.get(`/positions/${m.id}`),
        api.get(`/fog/${m.id}`),
        api.get(`/npc/map/${m.id}`)
      ])

      setPositions(posRes.data)
      setFogTiles(fogRes.data)
      setNpcs(npcRes.data)
    } catch (err) {
      console.error('❌ Error fetching map or data:', err)
    }
  }, [campaignId])

  useEffect(() => {
    if (campaignId) fetchData()
  }, [campaignId, fetchData])

  const placeCharacter = async (charId, x, y) => {
    await api.post('/positions/move', { characterId: charId, x, y, mapId: map.id })
  }

  const placeNpc = async (npcId, x, y) => {
    await api.put(`/npc/${npcId}/position`, { x, y })
  }

  const handleDrop = async (x, y) => {
    try {
      if (selectedCharacter) {
        await placeCharacter(selectedCharacter.id, x, y)
      } else if (selectedNpc) {
        await placeNpc(selectedNpc.id, x, y)
      }
      await fetchData()
      onPlaced?.()
    } catch (err) {
      alert('Не вдалося розмістити')
    }
  }

  const setFog = useCallback(async (x, y, hidden) => {
    const key = `${x},${y},${hidden}`
    if (drawnTiles.current.has(key)) return
    drawnTiles.current.add(key)

    try {
      await api.post('/fog/set', { mapId: map?.id, x, y, hidden })
      const fogRes = await api.get(`/fog/${map?.id}`)
      setFogTiles(fogRes.data)
    } catch (err) {
      console.error('❌ Не вдалося оновити туман:', err)
    }
  }, [map?.id])

  const { handleMouseDown: handleDragStart, handleMouseUp } = useDragMove(
    (charId, x, y) => placeCharacter(charId, x, y).then(fetchData),
    gridSize
  )

  // 🖱 Панорамування мапи (середня кнопка миші)
  const handleMouseDownPan = (e) => {
    if (e.button !== 1) return
    isPanning.current = true
    startPan.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }
    window.addEventListener('mousemove', handlePan)
    window.addEventListener('mouseup', stopPan)
  }

  const handlePan = (e) => {
    if (!isPanning.current) return
    setOffset({
      x: e.clientX - startPan.current.x,
      y: e.clientY - startPan.current.y
    })
  }

  const stopPan = () => {
    isPanning.current = false
    window.removeEventListener('mousemove', handlePan)
    window.removeEventListener('mouseup', stopPan)
  }

  // 🔍 Масштабування коліщатком
  const handleWheel = (e) => {
    e.preventDefault()
    const delta = -e.deltaY
    setScale((prev) => {
      const newScale = Math.min(Math.max(0.5, prev + delta * 0.001), 3)
      return newScale
    })
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDrawingFog || !containerRef.current || !map) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = Math.floor((e.clientX - rect.left - offset.x) / (gridSize * scale))
      const y = Math.floor((e.clientY - rect.top - offset.y) / (gridSize * scale))
      if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
        setFog(x, y, fogMode === 'add')
      }
    }

    const stop = () => {
      setIsDrawingFog(false)
      drawnTiles.current.clear()
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', stop)
    }

    if (isDrawingFog) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', stop)
    }

    return stop
  }, [isDrawingFog, map, fogMode, setFog, offset, scale])

  const handleClickOnGrid = (e) => {
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left - offset.x) / (gridSize * scale))
    const y = Math.floor((e.clientY - rect.top - offset.y) / (gridSize * scale))

    if (isDM && (selectedCharacter || selectedNpc)) {
      handleDrop(x, y)
    } else if (isDM) {
      setFog(x, y, fogMode === 'add')
    }
  }

  const handleMapMouseDown = (e) => {
    if (e.button === 0 && isDM && !(selectedCharacter || selectedNpc)) {
      setIsDrawingFog(true)
    } else if (e.button === 0 && (selectedCharacter || selectedNpc)) {
      handleMouseUp(e, containerRef)
    }
  }

  const handleDropOnMap = async (e) => {
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left - offset.x) / (gridSize * scale))
    const y = Math.floor((e.clientY - rect.top - offset.y) / (gridSize * scale))

    const npcId = e.dataTransfer.getData("npcId")
    if (npcId) {
      try {
        await placeNpc(npcId, x, y)
        await fetchData()
      } catch (err) {
        console.error("❌ Не вдалося перемістити NPC", err)
      }
    }
  }

  const handleNpcDragStart = (e, npcId) => {
    e.dataTransfer.setData("npcId", npcId)
  }

  if (!map) return <p>🕓 Завантаження мапи або мапа ще не активована...</p>

  return (
    <div
      ref={containerRef}
      className={styles.mapContainer}
      onMouseDown={(e) => {
        handleMapMouseDown(e)
        handleMouseDownPan(e)
      }}
      onClick={handleClickOnGrid}
      onContextMenu={(e) => e.preventDefault()}
      onDrop={handleDropOnMap}
      onDragOver={(e) => e.preventDefault()}
      onWheel={handleWheel}
    >
      <div
        className={styles.mapInner}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          width: map.width * gridSize,
          height: map.height * gridSize,
          backgroundImage: `url(${map.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {[...Array(map.width * map.height)].map((_, i) => (
          <div
            key={i}
            className={styles.cell}
            style={{
              top: Math.floor(i / map.width) * gridSize,
              left: (i % map.width) * gridSize,
              width: gridSize,
              height: gridSize,
            }}
          />
        ))}

        {positions.map(pos => {
          const canMove = isDM || pos.character.player.id === user.id
          return (
            <div
              key={pos.id}
              title={`${pos.character.name} (${pos.character.class})`}
              onMouseDown={(e) => canMove && handleDragStart(e, pos.character.id)}
              className={styles.character}
              style={{
                top: pos.y * gridSize,
                left: pos.x * gridSize,
                width: gridSize,
                height: gridSize,
                backgroundColor: canMove ? 'green' : 'gray'
              }}
            >
              {pos.character.name[0]}
            </div>
          )
        })}

        {npcs.map(npc => (
          <div
            key={npc.id}
            title={npc.name}
            draggable={isDM}
            onDragStart={(e) => handleNpcDragStart(e, npc.id)}
            className={styles.npc}
            style={{
              top: npc.y * gridSize,
              left: npc.x * gridSize,
              width: gridSize,
              height: gridSize,
              backgroundImage: `url(${npc.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        ))}

        {fogTiles.map((tile, i) => (
          <div
            key={`fog-${i}`}
            className={styles.fog}
            style={{
              top: tile.y * gridSize,
              left: tile.x * gridSize,
              width: gridSize,
              height: gridSize
            }}
          />
        ))}
      </div>
    </div>
  )
}
