import reactLogo from './assets/react.svg'
import snakeLogo from '/favicon.ico'

function App() {

  return (
    <>
      <div className="flex flex-row width-full justify-center py-4 px-10">
        <img src={reactLogo} className="logo react mr-2" alt="React logo" />
        <img src={snakeLogo} className="logo snake" alt="Snake logo" />
      </div>
      
      <div className="max-w-7xl mx-auto p-6 bg-surface rounded-md">
        Some stuff and things! The game board should probably have its own version of this div, so we can use it as reference.
      </div>
       
    </>
  )
}

export default App
