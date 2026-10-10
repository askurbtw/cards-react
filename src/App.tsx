import HomePage from './client/pages/HomePage'
import GamePage from './client/pages/GamePage'
import { GameContextProvider } from './client/context/GameContextProvider'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
const router = createBrowserRouter([{
  path: '/',
  element: <HomePage />
},
{
  path: '/GamePage/:roomId',
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