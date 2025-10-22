import { useState, useEffect } from "react"
import { generateHamiltonianCycle } from "../utils/hamiltonian"
import { getNewFood } from "../utils/gameUtils"

export default function useHamiltonianSnake(gridSize, enabled = true) {
  // all our manual setup
  const [snake, setSnake] = useState([{ x: 0, y: 0 }])
  const [food, setFood] = useState({ x: 1, y: 0 })
  const [running, setRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)

  // plus some new ones to help us set up a self-playing version
  const [path, setPath] = useState([])
  const [index, setIndex] = useState(0)

  // track progress through the grid
  useEffect(() => {
    if (gridSize) {
      const newPath = generateHamiltonianCycle(gridSize)
      setPath(newPath)
      setSnake([newPath[0]])
      setFood(getNewFood([newPath[0]], gridSize))
    }
  }, [gridSize])

  // keep all the same functionality, except now we need to track the path index
  useEffect(() => {
    if (!enabled || !running || path.length === 0) return

    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const nextIndex = (index + 1) % path.length

        const newHead = path[nextIndex]
        const newSnake = [newHead, ...prevSnake]
        
        setIndex(nextIndex)

        const ateFood = newHead.x === food.x && newHead.y === food.y

        if (ateFood) {
          setScore((prev) => prev + 100)
          const fresh = getNewFood(newSnake, gridSize)

          if (!fresh) setRunning(false)
          else setFood(fresh)
        } else {
          newSnake.pop()
        }

        return newSnake
      })
    }, 175)

    return () => clearInterval(interval)
  }, [running, path, index, food, gridSize])

  return { 
    snake, 
    setSnake,
    food,
    setFood,
    running, 
    setRunning, 
    gameOver, 
    setGameOver, 
    score,
    setScore,
    direction: null,
    setDirection: () => {},
    inputLocked: false,
    setInputLocked: () => {}
  }
}