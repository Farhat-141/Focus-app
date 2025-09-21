import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import CheckList from './component/checkList.jsx'

createRoot(document.querySelector('.to-do-section')).render(
  <StrictMode>
    <CheckList />
  </StrictMode>
)
