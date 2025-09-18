import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import CheckList from './component/checkList.jsx'

createRoot(document.getElementById('check-list-section')).render(
  <StrictMode>
    <CheckList />
  </StrictMode>
)

createRoot(document.getElementById('note-section')).render(
  <StrictMode>
    
  </StrictMode>
)
