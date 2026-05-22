import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, PenSquare, Menu, X } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)

  const isHome = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const textClass = isHome && !scrolled ? 'text-white' : 'text-stone-900'
  const bgClass   = isHome && !scrolled ? 'bg-transparent' : 'bg-white/95 backdrop-blur-md shadow-sm'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgClass}`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className={`font-serif text-2xl font-bold tracking-tight transition-colors ${textClass}`}>
          Wanderlust
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {user && (
            <>
              <Link to="/admin" className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-70 ${textClass}`}>
                <PenSquare size={15} /> Écrire
              </Link>
              <button onClick={logout} className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-70 ${textClass}`}>
                <LogOut size={15} /> Déconnexion
              </button>
            </>
          )}
          {!user && (
            <Link to="/login" className={`text-sm font-medium transition-colors hover:opacity-70 ${textClass}`}>
              Connexion
            </Link>
          )}
        </div>

        {/* Mobile */}
        <button className={`md:hidden ${textClass}`} onClick={() => setMenuOpen(v => !v)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-stone-100 px-6 py-4 space-y-3">
          {user ? (
            <>
              <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-stone-700 font-medium text-sm">
                <PenSquare size={15} /> Écrire un guide
              </Link>
              <button onClick={() => { logout(); setMenuOpen(false) }} className="flex items-center gap-2 text-stone-700 font-medium text-sm">
                <LogOut size={15} /> Déconnexion
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="text-stone-700 font-medium text-sm">Connexion</Link>
          )}
        </div>
      )}
    </nav>
  )
}
