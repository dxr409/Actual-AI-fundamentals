import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/lib/store'
import { authApi } from '@/lib/api'

export default function LoginPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleLang = () => i18n.changeLanguage(i18n.language === 'en' ? 'kk' : 'en')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.includes('@')) { setError(t('auth.error_email')); return }
    setLoading(true)
    try {
      const res = await authApi.login(email, password)
      login(res.data.user, res.data.token)
      navigate('/')
    } catch {
      // Offline / demo fallback — auto-create local session
      const name = email.split('@')[0].replace(/[._]/g, ' ')
      login({ id: email, email, name, role: 'student' }, 'local-demo-token')
      navigate('/')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#324052' }}>

      {/* Subtle maroon glow — #38160e incorporated */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl"
          style={{ background: '#38160e18' }} />
      </div>

      <div className="relative w-full max-w-sm animate-fade-in">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
            style={{ background: '#38160e', boxShadow: '0 0 32px #7c361f30' }}>
            <span style={{ color: '#f0ece8', fontFamily: '"Courier New"', fontWeight: 'bold', fontSize: 18 }}>Q</span>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary">{t('auth.title')}</h1>
          <p className="mt-1 text-sm text-text-muted">{t('auth.subtitle')}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              {t('auth.email')}
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@stud.qairu.kz" required
              className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-colors"
              style={{
                background: '#121011',
                color: '#f0ece8',
                border: '1px solid #4a5e72',
              }}
              onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = '#7c361f')}
              onBlur={(e)  => ((e.target as HTMLInputElement).style.borderColor = '#4a5e72')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              {t('auth.password')}
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required
              className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-colors"
              style={{ background: '#121011', color: '#f0ece8', border: '1px solid #4a5e72' }}
              onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = '#7c361f')}
              onBlur={(e)  => ((e.target as HTMLInputElement).style.borderColor = '#4a5e72')}
            />
          </div>

          {error && (
            <p className="text-xs rounded-lg px-3 py-2"
              style={{ color: '#e8a488', background: '#38160e20', border: '1px solid #7c361f40' }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
            {loading ? t('auth.signing_in') : t('auth.signin')}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-text-muted">{t('auth.forgot')}</p>

        <button onClick={toggleLang}
          className="mt-6 w-full text-center text-xs text-text-muted transition-colors"
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#e8a488')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '')}>
          {t('auth.language')}
        </button>
      </div>
    </div>
  )
}
