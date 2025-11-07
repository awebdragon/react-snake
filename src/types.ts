import type { Dispatch, SetStateAction } from "react"

export interface Position {
  x: number
  y: number
}

export interface SnakeGameState {
  snake: Position[]
  setSnake: Dispatch<SetStateAction<Position[]>>

  food: Position
  setFood: Dispatch<SetStateAction<Position>>

  direction: Position
  setDirection: Dispatch<SetStateAction<Position>>

  running: boolean
  setRunning: Dispatch<SetStateAction<boolean>>

  gameOver: boolean
  setGameOver: Dispatch<SetStateAction<boolean>>

  score: number
  setScore: Dispatch<SetStateAction<number>>

  inputLocked: boolean
  setInputLocked: Dispatch<SetStateAction<boolean>>
}
/**
 * Each React.Dispatch<React.SetStateAction<T>> type describes a state setter created by useState<T>().
 */

// since this is the manual game plus some extra stuff to automate things, we'll extend an interface we made earlier
export interface HamiltonianSnakeState extends SnakeGameState {
  path: Position[]
  pathIndex: number
  setPath: Dispatch<SetStateAction<Position[]>>
  setPathIndex: Dispatch<SetStateAction<number>>
}

export interface GameAPI {
  running: boolean
  handlePause: () => void
  handleReset: () => void
  score: number
  gameOver: boolean
}