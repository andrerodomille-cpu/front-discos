import { useState } from 'react'
import api, { getApiBaseUrl, setApiBaseUrl } from '../api/client'
import { CheckCircle2, XCircle, Loader2, Sun, Moon, Check } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function Configuracoes() {
  const [url, setUrl] = useState(getApiBaseUrl())
  const [status, setStatus] = useState(null)
  const [testando, setTestando] = useState(false)
  const { tema, setTema, accent, setAccent, accents } = useTheme()

  const salvar = (e) => {
    e.preventDefault()
    setApiBaseUrl(url)
    setStatus(null)
  }

  const testar = async () => {
    setTestando(true)
    setStatus(null)
    try {
      setApiBaseUrl(url)
      await api.get('/artistas')
      setStatus('ok')
    } catch {
      setStatus('erro')
    } finally {
      setTestando(false)
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold mb-2">Configurações</h1>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-accent uppercase tracking-wide mb-3">Aparência</h2>

        <p className="text-sm text-muted mb-2">Tema</p>
        <div className="flex gap-2 mb-5">
          <button
            type="button"
            onClick={() => setTema('light')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
              tema === 'light'
                ? 'bg-accent text-accent-contrast border-accent'
                : 'border-border-strong text-muted hover:border-accent hover:text-accent'
            }`}
          >
            <Sun className="w-4 h-4" /> Claro
          </button>
          <button
            type="button"
            onClick={() => setTema('dark')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
              tema === 'dark'
                ? 'bg-accent text-accent-contrast border-accent'
                : 'border-border-strong text-muted hover:border-accent hover:text-accent'
            }`}
          >
            <Moon className="w-4 h-4" /> Escuro
          </button>
        </div>

        <p className="text-sm text-muted mb-2">Cor de destaque</p>
        <div className="flex flex-wrap gap-3">
          {accents.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => setAccent(a.key)}
              title={a.label}
              aria-label={a.label}
              className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-transform hover:scale-110"
              style={{ backgroundColor: a.color, borderColor: accent === a.key ? a.color : 'transparent' }}
            >
              {accent === a.key && <Check className="w-4 h-4 text-accent-contrast" />}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-accent uppercase tracking-wide mb-3">Conexão com a API</h2>
        <p className="text-sm text-muted mb-6">
          Endereço da API. No navegador, use <code className="text-foreground">http://localhost:5000/api</code>.
          No app Android, use o IP da máquina que roda a API na sua rede local, por exemplo{' '}
          <code className="text-foreground">http://192.168.0.10:5000/api</code>.
        </p>
        <form onSubmit={salvar} className="flex flex-col gap-3">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="http://192.168.0.10:5000/api"
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-accent hover:bg-accent-hover text-accent-contrast font-medium px-4 py-2 rounded-lg text-sm"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={testar}
              disabled={testando}
              className="border border-border-strong hover:border-accent px-4 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {testando && <Loader2 className="w-4 h-4 animate-spin" />} Testar conexão
            </button>
          </div>
          {status === 'ok' && (
            <p className="flex items-center gap-2 text-emerald-500 text-sm">
              <CheckCircle2 className="w-4 h-4" /> Conectado com sucesso!
            </p>
          )}
          {status === 'erro' && (
            <p className="flex items-center gap-2 text-red-500 text-sm">
              <XCircle className="w-4 h-4" /> Não foi possível conectar. Verifique o endereço e se a API está rodando.
            </p>
          )}
        </form>
      </section>
    </div>
  )
}
