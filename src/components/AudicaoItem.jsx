import { Link } from 'react-router-dom'
import { Star, Trash2, MapPin, Disc3 } from 'lucide-react'

function formatarData(data) {
  if (!data) return '—'
  return new Date(data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export default function AudicaoItem({ audicao, onRemover }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-surface-2 transition-colors">
      <div className="w-9 h-9 rounded bg-surface-2 flex items-center justify-center shrink-0">
        <Disc3 className="w-4 h-4 text-faint" />
      </div>
      <Link to={`/audicoes/${audicao.id_audicao}/editar`} className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{audicao.disco_titulo || 'Disco removido'}</p>
        <p className="text-xs text-muted truncate">
          {[audicao.artista_nome, formatarData(audicao.data_audicao), audicao.local].filter(Boolean).join(' • ')}
        </p>
      </Link>
      {audicao.local && (
        <span className="hidden sm:flex items-center gap-1 text-xs text-faint w-28 shrink-0 truncate">
          <MapPin className="w-3 h-3 shrink-0" /> {audicao.local}
        </span>
      )}
      <span className="flex items-center gap-1 text-xs text-amber-500 w-10 shrink-0 justify-end">
        {audicao.nota ? (
          <>
            <Star className="w-3 h-3 fill-amber-500" /> {audicao.nota}
          </>
        ) : (
          <span className="text-faint">—</span>
        )}
      </span>
      <button
        type="button"
        onClick={() => onRemover(audicao.id_audicao)}
        title="Remover"
        aria-label="Remover"
        className="p-1.5 text-muted hover:text-red-500 hover:bg-surface-2 rounded shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
