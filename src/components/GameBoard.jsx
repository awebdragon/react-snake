import { useState, useEffect, useCallback } from "react"
import ScoreBoard from "./ScoreBoard"

const GameBoard = (props) => {
    const [snake, setSnake] = useState([{x: 10, y: 10}])
    const [food, setFood] = useState({ x: 14, y: 10 })

    // let's temporarily get the snake moving so we can test movement and movement-related functions, like what happens when she runs over a food square.
    const [direction, setDirection] = useState({ x: 1, y: 0 }) // start moving right
    const [running, setRunning] = useState(false)
    /**
     * {x:1, y:0} → right
     * {x:-1, y:0} → left
     * {x:0, y:1} → down
     * {x:0, y:-1} → up
     */

    // we need to be able to commit the current direction until the next interval, to prevent rapid key presses from doubling-back the snake
    const [inputLocked, setInputLocked] = useState(false)

    // stop - game over time
    const [gameOver, setGameOver] = useState(false)

    // score tracking
    const [score, setScore] = useState(0)

    // Allow keyboard controls, prevent snake from moving backwards into itself
    const handleKeyDown = useCallback((event) => { // a normal callback function - that is, a function that we set to be called *later*, like after a timeout or something else runs - will get rebuilt every render. We basically tell React "there's no need to rebuild this unless the dependencies updated, because the function is still behaving the same way". Re-building the function may not have much of an impact on our little snake app, but in large/complex apps and in cases where renders are happening often - even ours renders every couple hundred milliseconds, so pretty often compared to a typical webpage - it can be a big hit on performance. If our app gets complex enough, we may even start seeing input delays. We want to tell React "hey, this function hasn't changed, don't rebuild it each time the component updates" to save on that performance.
        const key = event.key.toLowerCase()
        if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", " "].includes(key)) {
            event.preventDefault()
        }

        // toggle pause/resume on spacebar
        if (key === " ") {
            setRunning((prevRunning) => !prevRunning)
            return // don’t also change direction
        }

        // ignore input if locked
        if (inputLocked) return

        setDirection((prevDir) => {
            // direction logic
            switch (key) {
                case "w":
                case "arrowup":
                    return prevDir.y === 1 ? prevDir : { x: 0, y: -1 }
                case "s":
                case "arrowdown":
                    return prevDir.y === -1 ? prevDir : { x: 0, y: 1 }
                case "a":
                case "arrowleft":
                    return prevDir.x === 1 ? prevDir : { x: -1, y: 0 }
                case "d":
                case "arrowright":
                    return prevDir.x === -1 ? prevDir : { x: 1, y: 0 }
                default:
                    return prevDir
            }
        })

        // lock input until next move tick
        setInputLocked(true)
    }, [])

    // build array of all the cells' positions
    const cells = Array.from(
        {length: props.gridSize * props.gridSize}, // make an array with this many slots
        (_, i) => ({ // and then fill it using this function. "_" is the current element value, which is undefined since we're only using length, so we use a throwaway variable name (so effectively, it’s like writing (ignored, i) or (unused, i)). "i" is the index, as usual.
            x: i % props.gridSize, // column number. Every time i reaches a multiple of the grid size, it resets to 0, starting over again on the left
            y: Math.floor(i / props.gridSize), // row number. Once you fill a whole row, the quotient goes up by 1
            // this is how to build a coordinate system using a flat list. Modulo (%) increments horizontally, while math.floor increments vertically.
            // To be honest, I don't have a head for math, so even after walking through to try to understand it I'm still a little lost. Glad other people are math nerds and figure this stuff out for the rest of us!
        })
    )

    const cellSize = 20 // pixels, for now — to implement responsive later

    useEffect(() => {
        if (!running) return

        const interval = setInterval(() => {
            setSnake((prevSnake) => {
                setInputLocked(false) // allow new input for the next tick

                const newHead = { // move the snake head per the direction
                    x: (prevSnake[0].x + direction.x + props.gridSize) % props.gridSize,
                    y: (prevSnake[0].y + direction.y + props.gridSize) % props.gridSize,
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

                if (!ateFood) newSnake.pop()
                else {
                    // update score
                    setScore( (prevScore) => prevScore + 100 )

                    // reposition food randomly, but avoid the snake body
                    let newFood
                    do{
                        newFood = {
                            x: Math.floor(Math.random() * props.gridSize),
                            y: Math.floor(Math.random() * props.gridSize),
                        }
                    } while (
                        newSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y) // we're used to seeing this .some by now, right? Check if any segment of the snake is on the proposed new food cell
                    )
                    setFood(newFood)
                }

                return newSnake
            })
        }, 175) // ms per interval

        return () => clearInterval(interval) // cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [running, direction, props.gridSize])

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [handleKeyDown])

    return (
        <>
            <ScoreBoard score={score} gameOver={gameOver} />

            <div
                className="grid border-3 border-surface-light bg-surface"
                style={{
                    gridTemplateColumns: `repeat(${props.gridSize}, ${cellSize}px)`,
                    gridTemplateRows: `repeat(${props.gridSize}, ${cellSize}px)`,
                }}
            >
                { cells.map((cell) => {
                    // first, we need to check whether any given cell is part of the snake's body
                    const isSnake = snake.some( // .some basically asks "does at least one element in the array meet the conditions I'm about to describe?" Returns true if ANY do, and false if NONE do.
                        (segment) => segment.x === cell.x && segment.y === cell.y // if at least one segment matches any of the coordinates in the snake object, return true
                    )
                    // we do the same thing for the food, matching the coordinates in the grid to the ones in the food object, but we don't need .some this time because the food is only ever one cell.
                    const isFood = food.x === cell.x && food.y === cell.y
    
                    // now to return what each grid cell will do - remember, we're still inside a .map, so this is EACH item in that new array
                    return(
                        <div
                            key={`${cell.x}-${cell.y}`}
                            className={[
                                "w-[20px] h-[20px] border",
                                isSnake && "bg-primary border-primary-dark",
                                isFood && "bg-tertiary border-tertiary-dark",
                                !isSnake && !isFood && "bg-surface border-surface-light",
                                ]
                                .filter(Boolean)
                                .join(" ")
                            } // we have some conditional JS logic in our className, so we need to use .filter to check for which conditions are true followed by .join to put them all together in a string so that Tailwind and our CSS can do its magic on the correct classes.
                        />
                    )
                }) }
            </div>

            {gameOver && (
                <div className="absolute inset-0 w-full h-vh flex flex-col justify-center items-center bg-black/70 z-10">
                    <h2 className="font-bold mb-4">Game Over</h2>
                    <button
                        onClick={() => {
                            setGameOver(false)
                            setSnake([{ x: 10, y: 10 }])
                            setDirection({ x: 1, y: 0 })
                            setFood({ x: 14, y: 10 })
                            setRunning(false)
                            setScore(0)
                        }}
                        className="button button--secondary text-lg"
                    >
                        Restart
                    </button>
                </div>
            )}
    
            <div className="mt-2 flex flex-row justify-center items-center">
                <button
                    onClick={() => setRunning((prevRunning) => !prevRunning)}
                    className="button button--primary"
                >
                    {running ? "Pause" : "Start"}
                </button>
                <button
                    onClick={() => {
                        setRunning(false)
                        setSnake([{ x: 10, y: 10 }])
                        setDirection({ x: 1, y: 0 })
                        setFood({ x: 14, y: 10 })
                        setScore(0)
                    }}
                    className="button button--secondary"
                >
                    Reset
                </button>
            </div>
        </>
    )
}

export default GameBoard