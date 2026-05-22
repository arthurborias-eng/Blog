import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import GuidePage from './pages/GuidePage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/"              element={<HomePage />} />
        <Route path="/guide/:id"     element={<GuidePage />} />
        <Route path="/admin"         element={<AdminPage />} />
        <Route path="/login"         element={<LoginPage />} />
      </Routes>
      <Toaster
        position="top-center"
        toastOptions={{ style: { borderRadius: '12px', fontWeight: 500 } }}
      />
    </AuthProvider>
  )
}
