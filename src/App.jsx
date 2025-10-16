import reactLogo from './assets/react.svg'
import snakeLogo from '/favicon.ico'

import GameBoard from "./components/GameBoard"

function App() {
  return (
    <div className="relative">
      <div className="flex flex-row w-full justify-center py-4 px-10 mb-6">
        <img src={reactLogo} className="logo react mr-2" alt="React logo" />
        <img src={snakeLogo} className="logo snake" alt="Snake logo" />
      </div>
      
      <main className="max-w-7xl mx-auto w-screen flex flex-col items-center justify-center">
        <GameBoard gridSize={20} />
      </main>
       
    </div>
  )
}

export default App
