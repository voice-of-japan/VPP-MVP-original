import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// StrictMode intentionally omitted: its dev-only double-mount opens/closes the
// rally WebSocket twice, producing confusing ERROR/CLOSED(1006) noise and extra
// socket churn. The single mount gives a clean, predictable connection lifecycle.
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
