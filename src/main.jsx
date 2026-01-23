import React from 'react'
import ReactDOM from 'react-dom/client'
import NetworkTopologyEditor from './network-topology-editor-v3.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { StorageProvider } from './contexts/StorageContext'
import AuthGuard from './components/auth/AuthGuard'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <StorageProvider>
        <AuthGuard>
          <NetworkTopologyEditor />
        </AuthGuard>
      </StorageProvider>
    </AuthProvider>
  </React.StrictMode>,
)
