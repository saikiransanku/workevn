import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../shared/theme/theme.css'
import AdminApp from './AdminApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
)
