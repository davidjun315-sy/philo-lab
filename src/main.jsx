import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ContentProvider } from './context/ContentContext'
import './styles/global.css'
import './styles/platform.css'

// HashRouter: GitHub Pages 같은 정적 호스팅에서 새로고침·직접 접속 시 404가 나지 않도록 합니다.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <ContentProvider>
          <App />
        </ContentProvider>
      </AuthProvider>
    </HashRouter>
  </StrictMode>,
)
