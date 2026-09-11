import HomePage from './pages/HomePage'
import GamePage from './pages/GamePage'
import { GameContextProvider } from './context/GameContextProvider'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
const router = createBrowserRouter([{
  path: '/',
  element: <HomePage />
},
{
  path: '/GamePage',
  element: <GamePage />
}])
function App() {
  return (
    <GameContextProvider>
      <RouterProvider router={router} />
    </GameContextProvider>
  )
}

export default App