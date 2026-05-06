import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { Toaster } from 'react-hot-toast'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
          <Toaster 
            position="top-right" 
            toastOptions={{
              style: {
                background: 'rgba(var(--color-dark-800), 0.9)',
                color: 'rgb(var(--color-dark-100))',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(var(--color-dark-600), 0.2)',
                borderRadius: '1rem',
              }
            }} 
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
