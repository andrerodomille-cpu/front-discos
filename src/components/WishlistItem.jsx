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
    <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-surface-2 transition-colors">
      <Link to={`/wishlist/${item.id_wishlist}/editar`} className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{item.titulo}</p>
        <p className="text-xs text-muted truncate">
          {[item.artista_nome, item.formato_nome, item.ano_lancamento].filter(Boolean).join(' • ') || 'Sem detalhes'}
        </p>
      </Link>
      <span className="hidden sm:inline-block text-xs text-faint w-20 shrink-0 text-right">
        {preco != null ? `R$ ${preco.toFixed(2)}` : '—'}
      </span>
      <span className="text-xs text-muted w-16 shrink-0 text-right">Prior. {item.prioridade}</span>
      <button
        type="button"
        onClick={() => onToggleAdquirido(item)}
        title={item.adquirido ? 'Marcar como não adquirido' : 'Marcar como adquirido'}
        aria-label={item.adquirido ? 'Marcar como não adquirido' : 'Marcar como adquirido'}
        className={`p-1.5 rounded shrink-0 ${item.adquirido ? 'text-emerald-500' : 'text-faint hover:text-accent'}`}
      >
        {item.adquirido ? <CheckCircle2 className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
      </button>
      <button
        type="button"
        onClick={() => onRemover(item.id_wishlist)}
        title="Remover"
        aria-label="Remover"
        className="p-1.5 text-muted hover:text-red-500 hover:bg-surface-2 rounded shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
