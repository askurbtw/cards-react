import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import '@fontsource/montserrat/500.css'
import '@fontsource/montserrat/700.css'


import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
