import reactLogo from './assets/react.svg'
import snakeLogo from '/favicon.ico'

import { useState, useEffect, useRef } from "react"

// hooks
import useSnakeGame from "./hooks/useSnakeGame"
import useKeyboardControls from "./hooks/useKeyboardControls"

// components
import GameBoard from "./components/GameBoard"
import Sidebar from "./components/Sidebar"

function App() {

	const [gridSize, setGridSize] = useState(null)
	const [cellSize, setCellSize] = useState(null)
	const [cellStyles, setCellStyles] = useState({})

	const [mode] = useState("manual"); // "manual" | "self-playing"

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

	// using imported hooks/utils
	const {
    snake,
    setSnake,
    food,
    setFood,
    // eslint-disable-next-line no-unused-vars
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
  } = useSnakeGame(gridSize)

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
	useKeyboardControls({
		running,
		setRunning,
		inputLocked,
		setInputLocked,
		setDirection,
	});

	const handleReset = () => {
		setGameOver(false)
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
					mode={mode}
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
							handleReset={handleReset}
						/>
					)}
				</div>
			</main>

			
			<div aria-live="polite" className="sr-only">
					{gameOver
							? `Game over. Final score: ${score}. Final snake length: ${snake.length}`
							: running
							? `Running. Score: ${score}. Snake length: ${snake.length}`
							: "Paused"
					}
			</div>
			
		</div>
	)
}

export default App
