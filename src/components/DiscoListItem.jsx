import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'

export default function DiscoListItem({ disco }) {
  return (
    <Link
      to={`/discos/${disco.id_disco}`}
      className="u-spine flex items-center gap-3 py-2.5 pl-4 pr-3 transition-colors hover:bg-surface-2"
    >
      <span className="u-condensed w-[34%] shrink-0 truncate text-[13px] uppercase text-muted">
        {disco.artista_nome || 'Artista desconhecido'}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm">{disco.titulo}</span>
      <span className="hidden w-28 shrink-0 truncate text-xs text-faint md:block">{disco.genero_nome || '—'}</span>
      <span className="u-ident hidden w-24 shrink-0 truncate text-faint lg:block">
        {disco.numero_catalogo || ''}
      </span>
      <span className="w-10 shrink-0 text-right text-xs tabular-nums text-faint">{disco.ano_lancamento || '—'}</span>
      <span className="flex w-9 shrink-0 items-center justify-end gap-1 text-xs text-amber-500">
        {disco.avaliacao ? (
          <>
            <Star className="h-3 w-3 fill-amber-500" /> {disco.avaliacao}
          </>
        ) : (
          <span className="text-faint">—</span>
        )}
      </span>
    </Link>
  )
}
