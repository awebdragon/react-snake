import { useState, useEffect } from "react";
import { getNewFood } from "../utils/gameUtils";

// for TS
import type { Position, SnakeGameState } from "../types"

export default function useSnakeGame(gridSize:number, enabled:boolean = true): SnakeGameState {
    const [snake, setSnake] = useState<Position[]>([{x: 10, y: 10}]) // ts: we're expecting an array of Position, which is our object type we set above
    const [food, setFood] = useState<Position>({ x: 14, y: 10 })
  
    // let's temporarily get the snake moving so we can test movement and movement-related functions, like what happens when she runs over a food square.
    const [direction, setDirection] = useState<Position>({ x: 1, y: 0 }) // start moving right
    const [running, setRunning] = useState<boolean>(false)
    /**
     * {x:1, y:0} → right
     * {x:-1, y:0} → left
     * {x:0, y:1} → down
     * {x:0, y:-1} → up
     */
  
    // we need to be able to commit the current direction until the next interval, to prevent rapid key presses from doubling-back the snake
    const [inputLocked, setInputLocked] = useState<boolean>(false)
  
    // stop - game over time
    const [gameOver, setGameOver] = useState<boolean>(false)
  
    // score tracking
    const [score, setScore] = useState<number>(0)
    
    /** for every variable declared above, we told TS what the expected type would be in <> brackets inside the value, since all of them are useStates */

    // making the snake move
    useEffect(() => {
        if (!enabled || !running || !gridSize) return

        const interval = setInterval(() => {
            setSnake((prevSnake: Position[]) => {
                setInputLocked(false) // allow new input for the next tick

                const newHead: Position = { // move the snake head per the direction
                    x: (prevSnake[0]!.x + direction.x + gridSize) % gridSize, // TS: that ! is telling TS that we promise this isn't undefined; our array will always have at least one item in it because the snake always has a head
                    y: (prevSnake[0]!.y + direction.y + gridSize) % gridSize,
                }

                // increase the snake length if she eats food
                const ateFood = newHead.x === food.x && newHead.y === food.y
                const newSnake = [newHead, ...prevSnake]

                // oops, ate myself
                const hitSelf = newSnake.slice(1).some((segment) => segment.x === newHead.x && segment.y === newHead.y) // ignoring the head, and running another "is the current cell a snake" .some method - does the current head overlap ANY of the x/y positions noted in the full snake body array?
                if (hitSelf){
                    setRunning(false)

                    setGameOver(true)

                    return prevSnake
                }

                if (!ateFood) {
                  newSnake.pop()
                } else {
                  setScore(prev => prev + 100)
                  const freshFood: Position | null = getNewFood(newSnake, gridSize) // remember, | = union - we're saying the type can either be Position or null

                  if(freshFood) setFood(freshFood)
                  else{
                    // include failsafe for nearly-full boards
                    setRunning(false); // game over, filled the board. Turn into "game won" screen at some point?
                  }
                }

                return newSnake
            })
        }, 175) // ms per interval, 175 default

        return () => clearInterval(interval) // cleanup
    }, [running, direction, gridSize, food])

    return {
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
    setInputLocked,
  };
}