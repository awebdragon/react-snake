import { useState, useEffect } from "react"
import { generateStaticPath } from "../utils/hamiltonian"
import { getNewFood } from "../utils/gameUtils"

export default function useHamiltonianSnake(gridSize, enabled = true) {
  const path = generateStaticPath();
  
  // all our manual setup
  const [snake, setSnake] = useState([{ x: 0, y: 0 }])
  const [food, setFood] = useState({ x: 1, y: 0 })
  const [running, setRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)

  // plus some new ones to help us set up a self-playing version
  const [index, setIndex] = useState(0)

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

        // reintroduce game over state, for when the snake fills the whole screen or runs into itself during shortcutting
        const hitSelf = newSnake
        .slice(1) // ignore the head
        .some(seg => seg.x === newHead.x && seg.y === newHead.y);

        if (hitSelf) {
          setRunning(false)
          setGameOver(true)
          return prevSnake
        }

        return newSnake
      })

      
    }, 100) // interval sets the speed, 175 is the default for manual, but the auto player should be faster so that there's less wait time

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