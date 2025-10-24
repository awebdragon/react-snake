import { useCallback, useEffect } from "react";

export default function useKeyboardControls({
  running,
  setRunning,
  inputLocked,
  setInputLocked,
  setDirection,
}){
  const handleKeyDown = useCallback((event) => { // a normal callback function - that is, a function that we set to be called *later*, like after a timeout or something else runs - will get rebuilt every render. We basically tell React "there's no need to rebuild this unless the dependencies updated, because the function is still behaving the same way". Re-building the function may not have much of an impact on our little snake app, but in large/complex apps and in cases where renders are happening often - even ours renders every couple hundred milliseconds, so pretty often compared to a typical webpage - it can be a big hit on performance. If our app gets complex enough, we may even start seeing input delays. We want to tell React "hey, this function hasn't changed, don't rebuild it each time the component updates" to save on that performance.
			const active = document.activeElement
			const isInput = ["INPUT", "BUTTON", "TEXTAREA"].includes(active.tagName)
			if (isInput) return // allow standard keyboard controls when the toggle is in focus

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

  // add a listener for key presses
	useEffect(() => {
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])
}