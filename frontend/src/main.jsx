import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuthContext from './context/authContext.jsx'

console.log(`
  %c TeamSync EMS %c by Yashraj Ghosalkar %c(@clexflex)
  %c
  Designed and developed with ❤️ for Maximize Market Research
  Type "clexflex" anywhere on the site for a surprise!
  `,
  'background: #1976d2; color: white; font-size: 16px; font-weight: bold; padding: 4px 8px; border-radius: 4px 0 0 4px;',
  'background: #333; color: white; font-size: 16px; padding: 4px 8px;',
  'background: #4caf50; color: white; font-size: 16px; padding: 4px 8px; border-radius: 0 4px 4px 0;',
  'font-size: 12px; color: #666;'
  );
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthContext>
      <App />
    </AuthContext>
  </StrictMode>,
)
