import { useRef } from 'react'

export default function useDragMove(onDrop, gridSize = 30) {
  const dragging = useRef(null)

  const handleMouseDown = (e, id) => {
    dragging.current = { id, offsetX: e.nativeEvent.offsetX, offsetY: e.nativeEvent.offsetY }
  }

  const handleMouseUp = (e, containerRef) => {
    if (!dragging.current || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / gridSize)
    const y = Math.floor((e.clientY - rect.top) / gridSize)

    onDrop(dragging.current.id, x, y)
    dragging.current = null
  }

  return { handleMouseDown, handleMouseUp }
}
