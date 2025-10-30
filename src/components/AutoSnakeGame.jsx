import {useEffect} from "react"

import GameBoard from "./GameBoard";
import useHamiltonianSnake from "../hooks/useHamiltonianSnake";

export default function AutoSnakeGame({ gridSize, cellStyles, exposeAPI }) {
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
  } = useHamiltonianSnake(gridSize)

  // Auto-start the snake once the grid and path are ready
  useEffect(() => {
    if (gridSize) {
      setRunning(true)
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
    setRunning(true)
  }

  // check for game over state
  useEffect(() => {
    if (gameOver) setRunning(false);
  }, [gameOver]);

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
  );
}