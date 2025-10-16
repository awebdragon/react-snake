import { useState, useEffect } from "react";

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

    const cellSize = 20; // pixels, for now — to implement responsive later

    useEffect(() => {
        if (!running) return

        const interval = setInterval(() => {
            setSnake((prevSnake) => { 
                const newHead = { // move the snake head per the direction
                    x: (prevSnake[0].x + direction.x + props.gridSize) % props.gridSize,
                    y: (prevSnake[0].y + direction.y + props.gridSize) % props.gridSize,
                }

                // increase the snake length if she eats food
                const ateFood = newHead.x === food.x && newHead.y === food.y
                const newSnake = [newHead, ...prevSnake]
                if (!ateFood) newSnake.pop()
                else {
                    // reposition food randomly
                    setFood({
                        x: Math.floor(Math.random() * props.gridSize),
                        y: Math.floor(Math.random() * props.gridSize),
                    });
                }

                return newSnake
            })
        }, 200) // ms per interval

        return () => clearInterval(interval) // cleanup
    }, [running, direction, food, props.gridSize])

    return (
        <>
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
    
            <button
                onClick={() => setRunning((prevRunning) => !prevRunning)}
                className="button button--primary"
            >
                {running ? "Pause" : "Start"}
            </button>
        </>
    )
}

export default GameBoard