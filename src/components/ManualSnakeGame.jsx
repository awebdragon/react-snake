import { useEffect } from "react"
import GameBoard from "./GameBoard"
import useSnakeGame from "../hooks/useSnakeGame"
import useKeyboardControls from "../hooks/useKeyboardControls"

export default function ManualSnakeGame({ gridSize, cellStyles, exposeAPI }) {
  // Hook up the game logic
  const {
    snake,
    setSnake,
    food,
    setFood,
    direction,
    setDirection,
    running,
    setRunning,
    gameOver,
    setGameOver,
    score,
    setScore,
    inputLocked,
    setInputLocked
  } = useSnakeGame(gridSize)

  // Keyboard input
  useKeyboardControls({
    running,
    setRunning,
    inputLocked,
    setInputLocked,
    setDirection
  })

  // Initialize snake + food position
  useEffect(() => {
    if (gridSize) {
      const center = Math.floor(gridSize / 2)
      setSnake([{ x: center, y: center }])
      setFood({
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
      })
    }
  }, [gridSize])

  // Reset handler
  const handleReset = () => {
    if (!gridSize) return
    const center = Math.floor(gridSize / 2)
    setGameOver(false)
    setRunning(false)
    setSnake([{ x: center, y: center }])
    setFood({
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    })
    setDirection({ x: 1, y: 0 })
    setScore(0)
  }

  // Expose public “API” to App
  useEffect(() => {
    if (!exposeAPI) return
    exposeAPI({
      running,
      handlePause: () => setRunning(prev => !prev),
      handleReset,
      score,
      gameOver,
    })
  }, [running, score, gameOver])

  // 6️⃣ Render
  return (
    <GameBoard
      gridSize={gridSize}
      cellStyles={cellStyles}
      snake={snake}
      food={food}
      gameOver={gameOver}
      score={score}
      running={running}
      handleReset={handleReset}
    />
  )
}