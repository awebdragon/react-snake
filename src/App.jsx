import reactLogo from './assets/react.svg'
import snakeLogo from '/favicon.ico'

import { useState, useEffect, useRef } from "react"

// components
import Sidebar from "./components/Sidebar"
import ManualSnakeGame from "./components/ManualSnakeGame"
import AutoSnakeGame from "./components/AutoSnakeGame"

function App() {

	const [gridSize, setGridSize] = useState(null)
	const [cellStyles, setCellStyles] = useState({})
	const [mode, setMode] = useState("auto") // "manual" | "auto"
	const [isChecked, setIsChecked] = useState(false)
  const [gameAPI, setGameAPI] = useState({})

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

			let clampGridSize = Math.floor(containerWidth / clampCellSize);

			//  Ensure even number of cells (for Hamiltonian path closure)
			if (clampGridSize % 2 !== 0) clampGridSize -= 1;

			setGridSize(clampGridSize)
			setCellStyles({
				aspectRatio: "1 / 1",
				width: `${containerWidth}px`,
				maxWidth: "100%",
				gridTemplateColumns: `repeat(${clampGridSize}, 1fr)`,
				gridTemplateRows: `repeat(${clampGridSize}, 1fr)`,
			})
		}
		calculateGrid()
	}, [])

	// mode toggle logic
	const handleToggle = () => {
    setIsChecked(prev => !prev)
    setMode(prev => (prev === "manual" ? "auto" : "manual"))
    gameAPI.handleReset?.() // reset when toggling
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
          isChecked={isChecked}
          handleToggle={handleToggle}
          running={gameAPI.running}
          handlePause={gameAPI.handlePause}
          handleReset={gameAPI.handleReset}
          score={gameAPI.score}
          gameOver={gameAPI.gameOver}
        />
			
				<div ref={containerRef} className='w-full md:w-8/12 mx-auto flex flex-row gap-2 items-center justify-center'>
					{gridSize && (
            mode === "manual" ? (
              <ManualSnakeGame
                gridSize={gridSize}
                cellStyles={cellStyles}
                exposeAPI={setGameAPI}
              />
            ) : (
              <AutoSnakeGame
                gridSize={gridSize}
                cellStyles={cellStyles}
                exposeAPI={setGameAPI}
              />
            )
          )}
				</div>
			</main>
		</div>
	)
}

export default App
