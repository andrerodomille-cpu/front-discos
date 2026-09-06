import { useState } from 'react'
import api, { getApiBaseUrl, setApiBaseUrl } from '../api/client'
import { CheckCircle2, XCircle, Loader2, Sun, Moon, Check } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import SectionHeading from '../components/SectionHeading'

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

  const opcaoTema = (valor, Icon, rotulo) => (
    <button
      type="button"
      onClick={() => setTema(valor)}
      className={`u-btn ${tema === valor ? 'u-btn-primary' : 'u-btn-ghost'}`}
    >
      <Icon className="h-4 w-4" /> {rotulo}
    </button>
  )

  return (
    <div className="max-w-md">
      <h1 className="mb-6 text-2xl">Configurações</h1>

      <section className="mb-10">
        <SectionHeading className="mb-4">Aparência</SectionHeading>

        <p className="mb-2 text-sm text-muted">Tema</p>
        <div className="mb-6 flex gap-2">
          {opcaoTema('light', Sun, 'Claro')}
          {opcaoTema('dark', Moon, 'Escuro')}
        </div>

        <p className="mb-2 text-sm text-muted">Cor de destaque</p>
        <div className="flex flex-wrap gap-2.5">
          {accents.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => setAccent(a.key)}
              title={a.label}
              aria-label={a.label}
              className="flex h-9 w-9 items-center justify-center rounded-[3px] transition-transform hover:scale-105"
              style={{
                backgroundColor: a.color,
                boxShadow: accent === a.key ? `0 0 0 2px var(--color-background), 0 0 0 4px ${a.color}` : 'none',
              }}
            >
              {accent === a.key && <Check className="h-4 w-4 text-white" />}
            </button>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading className="mb-4">Conexão com a API</SectionHeading>
        <p className="mb-5 text-sm leading-relaxed text-muted">
          Endereço da API. No navegador, use <code className="u-ident text-foreground">http://localhost:5000/api</code>. No app
          Android, use o IP da máquina que roda a API na sua rede local, por exemplo{' '}
          <code className="u-ident text-foreground">http://192.168.0.10:5000/api</code>.
        </p>
        <form onSubmit={salvar} className="flex flex-col gap-3">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="http://192.168.0.10:5000/api"
            className="u-field"
          />
          <div className="flex gap-2">
            <button type="submit" className="u-btn u-btn-primary px-4 py-2">
              Salvar
            </button>
            <button type="button" onClick={testar} disabled={testando} className="u-btn u-btn-ghost px-4 py-2">
              {testando && <Loader2 className="h-4 w-4 animate-spin" />} Testar conexão
            </button>
          </div>
          {status === 'ok' && (
            <p className="flex items-center gap-2 text-sm text-emerald-500">
              <CheckCircle2 className="h-4 w-4" /> Conectado com sucesso.
            </p>
          )}
          {status === 'erro' && (
            <p className="flex items-center gap-2 text-sm text-red-500">
              <XCircle className="h-4 w-4" /> Não foi possível conectar. Verifique o endereço e se a API está rodando.
            </p>
          )}
        </form>
      </section>
    </div>
  )
}
