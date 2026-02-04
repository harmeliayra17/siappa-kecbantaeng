import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom' // <--- 1. PASTIKAN INI ADA

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. PASTIKAN APP DIBUNGKUS BROWSERROUTER SEPERTI INI */}
    <BrowserRouter> 
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)