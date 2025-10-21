import React from 'react'
import { createRoot } from 'react-dom/client'

function App() {
  return <div style={{ padding: 24 }}>Vibeenengineer LMS</div>
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
