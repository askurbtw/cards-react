import HomePage from './client/pages/HomePage'
import GamePage from './client/pages/GamePage'
import { GameContextProvider } from './client/context/GameContextProvider'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { SocketContextProvider } from './client/context/SocketContextProvider'
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
    <SocketContextProvider>
    <GameContextProvider>
      <RouterProvider router={router} />
    </GameContextProvider></SocketContextProvider>
  )
}

export default App