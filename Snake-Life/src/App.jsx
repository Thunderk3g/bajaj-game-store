import React from 'react'
import { GameProvider } from './features/game/context/GameContext'
import GamePage from './pages/GamePage'

function App() {
  return (
    <GameProvider>
      <GamePage />
    </GameProvider>
  )
}

export default App
