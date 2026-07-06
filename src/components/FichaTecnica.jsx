import { Plus, Trash2 } from 'lucide-react'

const inputClass =
  'bg-surface border border-border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent'

export default function FichaTecnica({ linhas, musicos, instrumentos, onChange }) {
  const atualizarLinha = (index, campo, valor) => {
    const novas = linhas.map((linha, i) => (i === index ? { ...linha, [campo]: valor } : linha))
    onChange(novas)
  }

  const adicionarLinha = () => {
    onChange([...linhas, { id_musico: '', id_instrumento: '', faixas: '', observacoes: '' }])
  }

  const removerLinha = (index) => {
    onChange(linhas.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-3">
      {linhas.length === 0 && <p className="text-sm text-faint">Nenhum músico adicionado à ficha técnica.</p>}
      {linhas.map((linha, index) => (
        <div key={index} className="grid grid-cols-1 sm:grid-cols-[1.2fr_1.2fr_0.8fr_1.2fr_auto] gap-2 items-start bg-surface/60 border border-border rounded-lg p-2">
          <select
            value={linha.id_musico}
            onChange={(e) => atualizarLinha(index, 'id_musico', e.target.value)}
            className={inputClass}
          >
            <option value="">Músico...</option>
            {musicos.map((m) => (
              <option key={m.id_musico} value={m.id_musico}>
                {m.nome}
              </option>
            ))}
          </select>
          <select
            value={linha.id_instrumento}
            onChange={(e) => atualizarLinha(index, 'id_instrumento', e.target.value)}
            className={inputClass}
          >
            <option value="">Instrumento...</option>
            {instrumentos.map((i) => (
              <option key={i.id_instrumento} value={i.id_instrumento}>
                {i.nome}
              </option>
            ))}
          </select>
          <input
            value={linha.faixas}
            onChange={(e) => atualizarLinha(index, 'faixas', e.target.value)}
            placeholder="Faixas"
            className={inputClass}
          />
          <input
            value={linha.observacoes}
            onChange={(e) => atualizarLinha(index, 'observacoes', e.target.value)}
            placeholder="Observações"
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => removerLinha(index)}
            className="p-2 text-muted hover:text-red-500 hover:bg-surface-2 rounded justify-self-end"
            aria-label="Remover músico"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={adicionarLinha}
        className="flex items-center gap-2 text-sm text-accent hover:text-accent-hover self-start"
      >
        <Plus className="w-4 h-4" /> Adicionar músico
      </button>
    </div>
  )
}
