import makeSnakeColors from "../utils/snakeColorUtil"

interface Position {
  x: number
  y: number
}
/**
 * We used "type" in Sidebar, and here we're using "interface"
 * Both describe "shapes of data". Most times, they can be interchangeable. However.
 * 
 * Interfaces are open — you can extend or merge them.
 * interface Position { x: number; y: number }
 * interface Position { z?: number }
 * result: { x: number; y: number; z?: number }
 * Or:
 * interface DrawablePosition extends Position { color: string }
 * 
 * type is more flexible mathematically.
 * It can represent unions, intersections, tuples, primitive aliases, and more.
 * 
 * So type is like clay: you can mold complex forms and relationships between shapes.
 * Interfaces, by contrast, are like blueprints: you can add rooms later, but the structure is fundamentally an object.
 * 
 * Use interface when:
 * You’re describing the shape of an object, like component props or data models.
 * You expect it might be extended later.
 * You want to follow React’s ecosystem norms (props interfaces are common).
 * 
 * Use type when:
 * You’re defining unions, tuples, or combining multiple shapes.
 * You need literal types, utility types, or complex transformations.
 * You want to represent specific value sets or composable logic types.
 * 
 * Editor note: I'll be honest, I can follow the English of what the AI who's helping me understand this is saying... but I think the understanding of which one to use and when is probably going to come down to practicing more with different kinds of data and practicing working with data more often.
*/

interface GameBoardProps {
  gridSize: number
  cellStyles: React.CSSProperties
  snake: Position[]
  food: Position
  gameOver: boolean
  score: number
  running: boolean
  handleReset: () => void
}

const GameBoard = (props: GameBoardProps) => {
    // don't render until we have data
    if (!props.snake?.length || !props.food) return null;

    // build array of all the cells' positions
    const cells = Array.from(
        {length: props.gridSize * props.gridSize}, // make an array with this many slots
        (_, i): Position => ({ // and then fill it using this function. "_" is the current element value, which is undefined since we're only using length, so we use a throwaway variable name (so effectively, it’s like writing (ignored, i) or (unused, i)). "i" is the index, as usual. ": Position" is something we added between (_, i) and => for TypeScript - we're telling TS what kind of object we're building inside the map (we defined this at the top of the file)
            x: i % props.gridSize, // column number. Every time i reaches a multiple of the grid size, it resets to 0, starting over again on the left
            y: Math.floor(i / props.gridSize), // row number. Once you fill a whole row, the quotient goes up by 1
            // this is how to build a coordinate system using a flat list. Modulo (%) increments horizontally, while math.floor increments vertically.
            // To be honest, I don't have a head for math, so even after walking through to try to understand it I'm still a little lost. Glad other people are math nerds and figure this stuff out for the rest of us!
        })
    )

    // build gradient colors for current snake
    const colors: string[] = makeSnakeColors("#5E8D44", "#99C57F", props.snake.length); // adding ": String" before the = to let TypeScript know we're expecting an array of strings specifically

    return (
        <>
            <div
                className="relative grid border border-surface-light border-box bg-surface gap-0"
                style={props.cellStyles}
            >
                { cells.map((cell) => {
                    // first, we need to check whether any given cell is part of the snake's body
                    const isSnake = props.snake.some( // .some basically asks "does at least one element in the array meet the conditions I'm about to describe?" Returns true if ANY do, and false if NONE do.
                        (segment) => segment.x === cell.x && segment.y === cell.y // if at least one segment matches any of the coordinates in the snake object, return true
                    )
                    // now for some fun stuff. Let's find the head and the tail.
                    const head = props.snake[0]
                    const isHead = head.x === cell.x && head.y === cell.y
                    const tail = props.snake[props.snake.length - 1]
                    const isTail = tail.x === cell.x && tail.y === cell.y
                    const preTail = props.snake[props.snake.length - 2]
                    const nextHead = props.snake[1]

                    let headStyle = ""
                    let tailStyle = ""
                    let snakeStyle = ""
                    if (props.snake.length > 1) {
                        // tail styles
                        if (preTail.x < tail.x)
                            tailStyle = "tail-topright-bottomright"
                        else if (preTail.x > tail.x)
                            tailStyle = "tail-topleft-bottomleft"
                        else if (preTail.y < tail.y)
                            tailStyle = "tail-bottomleft-bottomright"
                        else if (preTail.y > tail.y)
                            tailStyle = "tail-topleft-topright"

                        // head styles
                        if (nextHead.x < head.x)
                            headStyle = "head-topright-bottomright"
                        else if (nextHead.x > head.x)
                            headStyle = "head-topleft-bottomleft"
                        else if (nextHead.y < head.y)
                            headStyle = "head-bottomleft-bottomright"
                        else if (nextHead.y > head.y)
                            headStyle = "head-topleft-topright"
                    } else {
                        snakeStyle = "less-heads-tails"
                    }

                    let colorVar = null;
                    if (isSnake) {
                    // find which segment this cell represents
                    const segIndex = props.snake.findIndex(
                        seg => seg.x === cell.x && seg.y === cell.y
                    );
                        colorVar = colors[segIndex];
                    }

                    // we do the same thing for the food, matching the coordinates in the grid to the ones in the food object, but we don't need .some this time because the food is only ever one cell.
                    const isFood = props.food.x === cell.x && props.food.y === cell.y
    
                    // now to return what each grid cell will do - remember, we're still inside a .map, so this is EACH item in that new array
                    return(
                        <div
                            key={`${cell.x}-${cell.y}`}
                            className={
                                [
                                    "w-full h-full box-border border",
                                    isSnake && "border-primary-darkest",
                                    isHead && "relative snake-head " + headStyle,
                                    isTail && "relative snake-tail " + tailStyle,
                                    isSnake && props.snake.length === 1 && "relative snake-tail " + snakeStyle,
                                    isFood && "relative food-cell border-surface-light",
                                    !isSnake && !isFood && "bg-surface border-surface-light",
                                ]
                                .filter(Boolean)
                                .join(" ")
                            } // we have some conditional JS logic in our className, so we need to use .filter to check for which conditions are true followed by .join to put them all together in a string so that Tailwind and our CSS can do its magic on the correct classes.
                            style={{
                                backgroundColor:
                                isSnake && !isHead && !isTail ? colorVar : "inherit",
                                "--snake-color": colorVar, // pseudo-elements will use this
                            }} // attempting to give the snake a nice gradient
                        />
                    )
                }) }

                {props.gameOver && (
                    <div className="absolute inset-0 w-full h-full flex flex-col justify-center items-center bg-black/80 z-10">
                        <h2 className="font-bold mb-6">Game Over</h2>
                        <button
                            onClick={props.handleReset}
                            className="button button--secondary text-lg"
                        >
                            Restart
                        </button>
                    </div>
                )}
            </div>
            <div aria-live="polite" className="sr-only">
                {props.gameOver
                        ? `Game over. Final score: ${props.score}. Final snake length: ${props.snake.length}`
                        : props.running
                        ? `Running. Score: ${props.score}. Snake length: ${props.snake.length}`
                        : "Paused"
                }
			</div>
        </>
    )
}

export default GameBoard