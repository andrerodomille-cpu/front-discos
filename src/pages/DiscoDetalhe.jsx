import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Disc3, Star, Loader2, Check } from 'lucide-react'
import api from '../api/client'

function formatarData(data) {
  if (!data) return null
  return new Date(data).toLocaleDateString('pt-BR')
}

function formatarValor(valor) {
  if (valor === null || valor === undefined || valor === '') return null
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function Item({ label, value }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  )
}

function Secao({ titulo, children }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-accent uppercase tracking-wide">{titulo}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{children}</div>
    </section>
  )
}

export default function DiscoDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [disco, setDisco] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    setCarregando(true)
    setErro(null)
    api
      .get('/discos')
      .then((res) => {
        const encontrado = res.data.find((d) => String(d.id_disco) === id)
        if (!encontrado) {
          setErro('Disco não encontrado.')
        } else {
          setDisco(encontrado)
        }
      })
      .catch((err) => setErro(err.response?.data?.error || err.message))
      .finally(() => setCarregando(false))
  }, [id])

  const excluir = async () => {
    if (!confirm('Excluir este disco da coleção? Essa ação não pode ser desfeita.')) return
    try {
      await api.delete(`/discos/${id}`)
      navigate('/')
    } catch (err) {
      setErro(err.response?.data?.error || err.message)
    }
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-20 text-faint gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Carregando...
      </div>
    )
  }

  if (erro || !disco) {
    return (
      <div>
        <Link to="/" className="flex items-center gap-2 text-sm text-muted hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <p className="text-red-500 text-sm">{erro || 'Disco não encontrado.'}</p>
      </div>
    )
  }

  const flags = [
    disco.primeira_prensagem && 'Primeira prensagem',
    disco.importado && 'Importado',
    disco.mono && 'Mono',
  ].filter(Boolean)

  const temDetalhesTecnicos = Boolean(
    disco.quantidade_discos || disco.rpm || disco.diametro_polegadas || disco.cor_vinil || disco.pais_origem || flags.length > 0,
  )
  const temEstadoAvaliacao = Boolean(disco.estado_vinil || disco.estado_capa || disco.resenha)
  const temAquisicao = Boolean(
    disco.gravadora_nome || disco.numero_catalogo || disco.loja_nome || disco.data_compra ||
      disco.valor_pago || disco.valor_estimado || disco.codigo_barras || disco.numero_serie,
  )

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to={`/discos/${id}/editar`}
            className="flex items-center gap-2 text-sm text-accent hover:text-accent-hover"
          >
            <Pencil className="w-4 h-4" /> Editar
          </Link>
          <button
            type="button"
            onClick={excluir}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" /> Excluir
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        <div className="w-full sm:w-56 h-56 rounded-xl bg-surface-2 border border-border flex items-center justify-center overflow-hidden shrink-0 mx-auto sm:mx-0">
          {disco.url_capa ? (
            <img
              src={disco.url_capa}
              alt={disco.titulo}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <Disc3 className="w-16 h-16 text-faint" />
          )}
        </div>
        <div className="flex flex-col gap-2 justify-center text-center sm:text-left">
          <h1 className="text-2xl font-semibold leading-tight">{disco.titulo}</h1>
          <p className="text-muted">{disco.artista_nome || 'Artista desconhecido'}</p>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-1">
            {disco.genero_nome && (
              <span className="text-xs px-2 py-1 rounded-full border border-border-strong text-muted">{disco.genero_nome}</span>
            )}
            {disco.formato_nome && (
              <span className="text-xs px-2 py-1 rounded-full border border-border-strong text-muted">{disco.formato_nome}</span>
            )}
            {disco.ano_lancamento && (
              <span className="text-xs px-2 py-1 rounded-full border border-border-strong text-muted">{disco.ano_lancamento}</span>
            )}
            {disco.avaliacao ? (
              <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full border border-border-strong text-amber-500">
                <Star className="w-3 h-3 fill-amber-500" /> {disco.avaliacao}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {temDetalhesTecnicos && (
          <Secao titulo="Detalhes técnicos">
            <Item label="Quantidade de discos" value={disco.quantidade_discos} />
            <Item label="RPM" value={disco.rpm} />
            <Item label="Diâmetro" value={disco.diametro_polegadas ? `${disco.diametro_polegadas}"` : null} />
            <Item label="Cor do vinil" value={disco.cor_vinil} />
            <Item label="País de origem" value={disco.pais_origem} />
            {flags.length > 0 && (
              <div className="flex flex-col gap-0.5 col-span-2 sm:col-span-3">
                <span className="text-xs text-muted">Características</span>
                <div className="flex flex-wrap gap-3">
                  {flags.map((f) => (
                    <span key={f} className="flex items-center gap-1 text-sm">
                      <Check className="w-3.5 h-3.5 text-accent" /> {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Secao>
        )}

        {temEstadoAvaliacao && (
          <Secao titulo="Estado e avaliação">
            <Item label="Estado do vinil" value={disco.estado_vinil} />
            <Item label="Estado da capa" value={disco.estado_capa} />
            {disco.resenha && (
              <div className="flex flex-col gap-0.5 col-span-2 sm:col-span-3">
                <span className="text-xs text-muted">Resenha</span>
                <span className="text-sm whitespace-pre-wrap">{disco.resenha}</span>
              </div>
            )}
          </Secao>
        )}

        {temAquisicao && (
          <Secao titulo="Aquisição">
            <Item label="Gravadora" value={disco.gravadora_nome} />
            <Item label="Número de catálogo" value={disco.numero_catalogo} />
            <Item label="Loja" value={disco.loja_nome} />
            <Item label="Data da compra" value={formatarData(disco.data_compra)} />
            <Item label="Valor pago" value={formatarValor(disco.valor_pago)} />
            <Item label="Valor estimado" value={formatarValor(disco.valor_estimado)} />
            <Item label="Código de barras" value={disco.codigo_barras} />
            <Item label="Número de série" value={disco.numero_serie} />
          </Secao>
        )}

        {disco.observacoes && (
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-accent uppercase tracking-wide">Observações</h2>
            <p className="text-sm whitespace-pre-wrap">{disco.observacoes}</p>
          </section>
        )}

        {disco.musicos_ficha_tecnica && disco.musicos_ficha_tecnica.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-accent uppercase tracking-wide">Ficha técnica</h2>
            <div className="border border-border rounded-lg divide-y divide-border overflow-hidden bg-surface">
              {disco.musicos_ficha_tecnica.map((m) => (
                <div key={m.id_disco_musico} className="px-3 py-2.5 text-sm">
                  <p>
                    <span className="font-medium">{m.musico_nome || 'Músico desconhecido'}</span>
                    {m.instrumento_nome && <span className="text-muted"> — {m.instrumento_nome}</span>}
                  </p>
                  {(m.faixas || m.observacoes_musico) && (
                    <p className="text-xs text-muted mt-0.5">
                      {[m.faixas && `Faixas: ${m.faixas}`, m.observacoes_musico].filter(Boolean).join(' • ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
