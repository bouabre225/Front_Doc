import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './client/i18n/i18n.js'
import { CartProvider } from './client/context/CartContext'

createRoot(document.getElementById('root')).render(
  <CartProvider>
    <App />
  </CartProvider>,
)