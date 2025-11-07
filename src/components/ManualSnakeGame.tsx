import { useEffect } from "react"
import GameBoard from "./GameBoard"
import useSnakeGame from "../hooks/useSnakeGame"
import useKeyboardControls from "../hooks/useKeyboardControls"

// for TS
import type { Position, GameAPI } from "../types"

interface ManualSnakeGameProps {
  gridSize: number
  cellStyles: React.CSSProperties
  exposeAPI?: (api: GameAPI) => void // the ?:, remember, means that this prop is optional. The value is a function - a function that takes one argument named "api", which must be a GameAPI object, and it returns nothing (void). To put it another way: If you give me an exposeAPI prop, it needs to be a function that receives the game’s public API object, and doesn’t return a value I need to care about.
  // input ──▶ [GameAPI-shaped thing] ──▶ returns nothing

}
/**
 * Why interface again?
 * Because both of these describe objects with known properties — blueprints we might extend later when the API grows.
 */

export default function ManualSnakeGame({ gridSize, cellStyles, exposeAPI }: ManualSnakeGameProps) {
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
    // code before TS refactor:
    // exposeAPI({
    //   running,
    //   handlePause: () => setRunning(prev => !prev),
    //   handleReset,
    //   score,
    //   gameOver,
    // })

    const api: GameAPI = {
      running,
      handlePause: () => setRunning(prev => !prev),
      handleReset,
      score,
      gameOver,
    }
    exposeAPI(api)
    /**
     * builds a GameAPI object named "api" containing the game’s public methods and state, then calls exposeAPI(api) if that prop exists.
     */
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