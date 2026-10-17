import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Find the root HTML element and start the React application inside it.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/*

StrictMode: A React development tool that detects potential problem in the code while developing
createRoot: Tells React this is where the application should live
App: Main component tht contains the rest if our website

*/
