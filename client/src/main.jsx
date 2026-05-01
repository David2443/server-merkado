// client/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
// Importăm Router-ul
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Îmbrăcăm toată aplicația în BrowserRouter */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)