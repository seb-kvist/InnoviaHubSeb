import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { connection } from './signalRConnection.ts'


connection.start()
  .then(() => console.log("✅ SignalR connected"))
  .catch(err => console.error("❌ SignalR connection error:", err));


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
