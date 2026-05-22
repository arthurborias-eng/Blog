import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await login(email, password)
    if (error) { toast.error('Email ou mot de passe incorrect'); setLoading(false) }
    else { toast.success('Connecté !'); navigate('/admin') }
  }

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-4xl font-bold text-warm-800 mb-1 text-center">Wanderlust</h1>
        <p className="text-warm-300 text-sm text-center mb-10 italic">Espace rédaction</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-cream-200 p-8 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-warm-500 uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-cream-200 focus:outline-none focus:border-terra-400 text-warm-800 bg-cream-50 text-sm transition-colors"
              placeholder="vous@exemple.fr"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-warm-500 uppercase tracking-wider mb-2">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-cream-200 focus:outline-none focus:border-terra-400 text-warm-800 bg-cream-50 text-sm transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-terra-500 hover:bg-terra-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
