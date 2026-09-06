import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Disc3, Star, Loader2 } from 'lucide-react'
import api from '../api/client'
import SectionHeading from '../components/SectionHeading'

function formatarData(data) {
  if (!data) return null
  return new Date(data).toLocaleDateString('pt-BR')
}

function formatarValor(valor) {
  if (valor === null || valor === undefined || valor === '') return null
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function Linha({ label, valor, ident }) {
  if (valor === null || valor === undefined || valor === '') return null
  return (
    <div className="u-credit">
      <span className="k">{label}</span>
      <span className="fill" />
      <span className={`v ${ident ? 'u-ident' : ''}`}>{valor}</span>
    </div>
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
        if (!encontrado) setErro('Disco não encontrado.')
        else setDisco(encontrado)
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
      <div className="flex items-center justify-center gap-2 py-20 text-faint">
        <Loader2 className="h-5 w-5 animate-spin" /> Carregando…
      </div>
    )
  }

  if (erro || !disco) {
    return (
      <div>
        <Link to="/" className="mb-6 flex items-center gap-2 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <p className="text-sm text-red-500">{erro || 'Disco não encontrado.'}</p>
      </div>
    )
  }

  const flags = [
    disco.primeira_prensagem && 'Primeira prensagem',
    disco.importado && 'Importado',
    disco.mono && 'Mono',
    disco.coletanea && 'Coletânea',
    disco._180gramas && '180 gramas',
  ].filter(Boolean)

  const specs = [
    disco.formato_nome,
    disco.diametro_polegadas && `${disco.diametro_polegadas}″`,
    disco.mono && 'Mono',
    disco.ano_lancamento,
  ].filter(Boolean)

  const temDetalhesTecnicos = Boolean(
    disco.quantidade_discos || disco.rpm || disco.diametro_polegadas || disco.cor_vinil ||
      disco.ano_prensagem || disco.pais_origem || flags.length > 0,
  )
  const temEstadoAvaliacao = Boolean(disco.estado_vinil || disco.estado_capa || disco.resenha)
  const temAquisicao = Boolean(
    disco.gravadora_nome || disco.numero_catalogo || disco.loja_nome || disco.data_compra ||
      disco.valor_pago || disco.valor_estimado || disco.codigo_barras || disco.numero_serie,
  )

  return (
    <div className="max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <div className="flex items-center gap-4">
          <Link to={`/discos/${id}/editar`} className="flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover">
            <Pencil className="h-4 w-4" /> Editar
          </Link>
          <button type="button" onClick={excluir} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600">
            <Trash2 className="h-4 w-4" /> Excluir
          </button>
        </div>
      </div>

      <div className="mb-9 flex flex-col gap-6 sm:flex-row sm:gap-7">
        <div className="u-sleeve mx-auto flex aspect-square w-full max-w-[15rem] shrink-0 items-center justify-center overflow-hidden sm:mx-0 sm:w-56">
          {disco.url_capa ? (
            <img
              src={disco.url_capa}
              alt={disco.titulo}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <Disc3 className="h-16 w-16 text-faint" />
          )}
        </div>
        <div className="flex flex-col justify-center gap-2 text-center sm:text-left">
          <h1 className="text-[clamp(1.7rem,4.5vw,2.5rem)]">{disco.titulo}</h1>
          <p className="text-lg text-muted">{disco.artista_nome || 'Artista desconhecido'}</p>
          {specs.length > 0 && (
            <p className="mt-0.5 text-sm text-faint">{specs.join('  ·  ')}</p>
          )}
          <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
            {disco.estado_vinil && (
              <span className="border border-border-strong px-2 py-0.5 text-xs text-muted">Vinil · {disco.estado_vinil}</span>
            )}
            {disco.estado_capa && (
              <span className="border border-border-strong px-2 py-0.5 text-xs text-muted">Capa · {disco.estado_capa}</span>
            )}
            {disco.avaliacao ? (
              <span className="flex items-center gap-1 border border-border-strong px-2 py-0.5 text-xs text-amber-500">
                <Star className="h-3 w-3 fill-amber-500" /> {disco.avaliacao}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-9">
        {temDetalhesTecnicos && (
          <section className="flex flex-col gap-3">
            <SectionHeading>Detalhes técnicos</SectionHeading>
            <div className="u-credits">
              <Linha label="Quantidade de discos" valor={disco.quantidade_discos} />
              <Linha label="RPM" valor={disco.rpm} />
              <Linha label="Diâmetro" valor={disco.diametro_polegadas ? `${disco.diametro_polegadas}″` : null} />
              <Linha label="Cor do vinil" valor={disco.cor_vinil} />
              <Linha label="Ano da prensagem" valor={disco.ano_prensagem} />
              <Linha label="País de origem" valor={disco.pais_origem} />
            </div>
            {flags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {flags.map((f) => (
                  <span key={f} className="border border-border-strong px-2 py-0.5 text-xs text-muted">
                    {f}
                  </span>
                ))}
              </div>
            )}
          </section>
        )}

        {temEstadoAvaliacao && (
          <section className="flex flex-col gap-3">
            <SectionHeading>Estado e avaliação</SectionHeading>
            <div className="u-credits">
              <Linha label="Estado do vinil" valor={disco.estado_vinil} />
              <Linha label="Estado da capa" valor={disco.estado_capa} />
            </div>
            {disco.resenha && <p className="whitespace-pre-wrap text-sm leading-relaxed">{disco.resenha}</p>}
          </section>
        )}

        {temAquisicao && (
          <section className="flex flex-col gap-3">
            <SectionHeading>Aquisição</SectionHeading>
            <div className="u-credits">
              <Linha label="Gravadora" valor={disco.gravadora_nome} />
              <Linha label="Número de catálogo" valor={disco.numero_catalogo} ident />
              <Linha label="Loja" valor={disco.loja_nome} />
              <Linha label="Data da compra" valor={formatarData(disco.data_compra)} />
              <Linha label="Valor pago" valor={formatarValor(disco.valor_pago)} />
              <Linha label="Valor estimado" valor={formatarValor(disco.valor_estimado)} />
              <Linha label="Código de barras" valor={disco.codigo_barras} ident />
              <Linha label="Número de série" valor={disco.numero_serie} ident />
            </div>
          </section>
        )}

        {disco.observacoes && (
          <section className="flex flex-col gap-3">
            <SectionHeading>Observações</SectionHeading>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{disco.observacoes}</p>
          </section>
        )}

        {disco.musicos_ficha_tecnica && disco.musicos_ficha_tecnica.length > 0 && (
          <section className="flex flex-col gap-3">
            <SectionHeading>Ficha técnica</SectionHeading>
            <div className="u-credits">
              {disco.musicos_ficha_tecnica.map((m) => (
                <div key={m.id_disco_musico} className="u-credit flex-wrap">
                  <span className="k text-foreground">{m.musico_nome || 'Músico desconhecido'}</span>
                  <span className="fill" />
                  <span className="v">{m.instrumento_nome || '—'}</span>
                  {(m.faixas || m.observacoes_musico) && (
                    <p className="mt-0.5 w-full text-xs text-muted">
                      {[m.faixas && `Faixas: ${m.faixas}`, m.observacoes_musico].filter(Boolean).join('  ·  ')}
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
