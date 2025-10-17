import reactLogo from './assets/react.svg'
import snakeLogo from '/favicon.ico'

import { useState, useEffect, useRef, useCallback } from "react"

import GameBoard from "./components/GameBoard"
import Sidebar from "./components/Sidebar"

function App() {
	const [gridSize, setGridSize] = useState(null)
	const [cellSize, setCellSize] = useState(null)
	const [cellStyles, setCellStyles] = useState({})

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

	const containerRef = useRef()

	// set up the grid. Use the container element's initial width, then fix it so that the grid size doesn't change if the screen is resized without refreshing/re-mounting
	useEffect(() => {
		const calculateGrid = () => {
			const containerWidth = containerRef.current?.offsetWidth || window.innerWidth // ?. allows us to check if any part of the chain is null or undefined, so we can return undefined instead of throwing an error. First, check the container for an offsetWidth value, otherwise use the window innerWidth.
			const maxCells = 30 // set a maximum amount of cells wide
			const minCellPx = 20 // minimum visual size of each cell

			const clampCellSize = Math.max(
				minCellPx,
				Math.floor(containerWidth / maxCells)
			)

			const clampGridSize = Math.floor(containerWidth / clampCellSize)

			setGridSize(clampGridSize)
			setCellSize(clampCellSize)
			setCellStyles({
				aspectRatio: "1 / 1",
				width: `${containerWidth}px`,
				maxWidth: "100%",
				gridTemplateColumns: `repeat(${clampGridSize}, 1fr)`,
				gridTemplateRows: `repeat(${clampGridSize}, 1fr)`,
			})
		};
		calculateGrid()
	}, []);

	// now that we've calculated the grid, we can implement a function that centers (roughly) the snake on the grid, and randomizes the food starting point.
	useEffect(() => {
		if (gridSize) {
			// center the snake on the grid
			const center = Math.floor(gridSize / 2)
			setSnake([{ x: center, y: center }])

			// give the food a random starting cell
			setFood({
				x: Math.floor(Math.random() * gridSize),
				y: Math.floor(Math.random() * gridSize),
			})
		}
	}, [gridSize])

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
	}, [inputLocked])

	// food helper
	const getNewFood = (snake, gridSize) => {
		let newFood;
		do {
			newFood = {
				x: Math.floor(Math.random() * gridSize),
				y: Math.floor(Math.random() * gridSize),
			};
		} while (snake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
		return newFood;
	};

	// making the snake move
	useEffect(() => {
			if (!running) return

			const interval = setInterval(() => {
					setSnake((prevSnake) => {
							setInputLocked(false) // allow new input for the next tick

							const newHead = { // move the snake head per the direction
									x: (prevSnake[0].x + direction.x + gridSize) % gridSize,
									y: (prevSnake[0].y + direction.y + gridSize) % gridSize,
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
								newSnake.pop();
							} else {
								setScore(prev => prev + 100);
								const freshFood = getNewFood(newSnake, gridSize);
								setFood(freshFood);
							}

							return newSnake
					})
			}, 175) // ms per interval

			return () => clearInterval(interval) // cleanup
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [running, direction, gridSize, food])

	// add a listener for key presses
	useEffect(() => {
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [handleKeyDown])

	const handleGameOverReset = () => {
		setGameOver(false)
		setSnake([{ x: 10, y: 10 }])
		setDirection({ x: 1, y: 0 })
		setFood({ x: 14, y: 10 })
		setRunning(false)
		setScore(0)
	}
	const handleReset = () => {
		setRunning(false)
		setSnake([{ x: 10, y: 10 }])
		setDirection({ x: 1, y: 0 })
		setFood({ x: 14, y: 10 })
		setScore(0)
	}
	const handlePause = () => {
		setRunning((prevRunning) => !prevRunning)
	}

	return (
		<div>
			<header className="flex flex-row w-full justify-center py-4 px-10 mb-6">
				<img src={reactLogo} className="logo react mr-2" alt="React logo" />
				<img src={snakeLogo} className="logo snake" alt="Snake logo" />
			</header>
			
			<main className="w-xs sm:w-xl md:w-2xl lg:w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 lg:gap-6">
				<Sidebar 
					score={score}
					gameOver={gameOver}
					running={running}
					handlePause={handlePause}
					handleReset={handleReset}
				/>
				<div ref={containerRef} className='w-full md:w-8/12 mx-auto flex flex-row gap-2 items-center justify-center'>
					{gridSize && cellSize && (
						<GameBoard
							gridSize={gridSize}
							cellStyles={cellStyles}
							snake={snake}
							food={food}
							gameOver={gameOver}
							score={score}
							handleGameOverReset={handleGameOverReset}
						/>
					)}
				</div>
			</main>
			
		</div>
	)
}

export default App
