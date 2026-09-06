import { Link } from 'react-router-dom'
import { Star, Trash2, MapPin, Disc3 } from 'lucide-react'

function formatarData(data) {
  if (!data) return '—'
  return new Date(data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export default function AudicaoItem({ audicao, onRemover }) {
  return (
    <div className="u-spine flex items-center gap-3 py-2.5 pl-4 pr-3 transition-colors hover:bg-surface-2">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[2px] bg-surface-2">
        {audicao.disco_capa ? (
          <img
            src={audicao.disco_capa}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <Disc3 className="h-4 w-4 text-faint" />
        )}
      </div>
      <Link to={`/audicoes/${audicao.id_audicao}/editar`} className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-semibold tracking-[-0.01em]">
          {audicao.disco_titulo || 'Disco removido'}
        </p>
        <p className="truncate text-xs text-muted">
          {[audicao.artista_nome, formatarData(audicao.data_audicao)].filter(Boolean).join('  ·  ')}
        </p>
      </Link>
      {audicao.local && (
        <span className="hidden w-28 shrink-0 items-center gap-1 truncate text-xs text-faint sm:flex">
          <MapPin className="h-3 w-3 shrink-0" /> {audicao.local}
        </span>
      )}
      <span className="flex w-10 shrink-0 items-center justify-end gap-1 text-xs text-amber-500">
        {audicao.nota ? (
          <>
            <Star className="h-3 w-3 fill-amber-500" /> {audicao.nota}
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
        className="shrink-0 rounded-[3px] p-1.5 text-muted hover:bg-surface-2 hover:text-red-500"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
