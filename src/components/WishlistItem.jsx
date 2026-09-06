import { Link } from 'react-router-dom'
import { Heart, Trash2, CheckCircle2 } from 'lucide-react'

function menorPreco(historico) {
  if (!historico || historico.length === 0) return null
  const valores = historico.map((p) => Number(p.valor)).filter((v) => !Number.isNaN(v))
  if (valores.length === 0) return null
  return Math.min(...valores)
}

export default function WishlistItem({ item, onToggleAdquirido, onRemover }) {
  const preco = menorPreco(item.historico_precos)

  return (
    <div className="u-spine flex items-center gap-3 py-2.5 pl-4 pr-3 transition-colors hover:bg-surface-2">
      <span
        className="u-ident w-7 shrink-0 text-faint"
        title={`Prioridade ${item.prioridade}`}
      >
        P{item.prioridade}
      </span>
      <Link to={`/wishlist/${item.id_wishlist}/editar`} className="min-w-0 flex-1">
        <p className={`truncate font-display text-sm font-semibold tracking-[-0.01em] ${item.adquirido ? 'line-through decoration-faint' : ''}`}>
          {item.titulo}
        </p>
        <p className="truncate text-xs text-muted">
          {[item.artista_nome, item.formato_nome, item.ano_lancamento].filter(Boolean).join('  ·  ') || 'Sem detalhes'}
        </p>
      </Link>
      <span className="hidden w-24 shrink-0 text-right text-xs tabular-nums text-faint sm:inline-block">
        {preco != null ? `R$ ${preco.toFixed(2)}` : '—'}
      </span>
      <button
        type="button"
        onClick={() => onToggleAdquirido(item)}
        title={item.adquirido ? 'Marcar como não adquirido' : 'Marcar como adquirido'}
        aria-label={item.adquirido ? 'Marcar como não adquirido' : 'Marcar como adquirido'}
        className={`shrink-0 rounded-[3px] p-1.5 ${item.adquirido ? 'text-accent' : 'text-faint hover:text-accent'}`}
      >
        {item.adquirido ? <CheckCircle2 className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
      </button>
      <button
        type="button"
        onClick={() => onRemover(item.id_wishlist)}
        title="Remover"
        aria-label="Remover"
        className="shrink-0 rounded-[3px] p-1.5 text-muted hover:bg-surface-2 hover:text-red-500"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
