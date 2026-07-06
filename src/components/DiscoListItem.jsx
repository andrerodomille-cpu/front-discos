import { Link } from 'react-router-dom'
import { Disc3, Star } from 'lucide-react'

export default function DiscoListItem({ disco }) {
  return (
    <Link
      to={`/discos/${disco.id_disco}`}
      className="flex items-center gap-3 px-3 py-2 hover:bg-surface-2 transition-colors"
    >
      <div className="w-11 h-11 rounded bg-surface-2 flex items-center justify-center overflow-hidden shrink-0">
        {disco.url_capa ? (
          <img
            src={disco.url_capa}
            alt={disco.titulo}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <Disc3 className="w-5 h-5 text-faint" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{disco.titulo}</p>
        <p className="text-xs text-muted truncate">{disco.artista_nome || 'Artista desconhecido'}</p>
      </div>
      <p className="hidden sm:block text-xs text-muted truncate w-32 shrink-0">{disco.genero_nome || '—'}</p>
      <p className="hidden md:block text-xs text-muted truncate w-32 shrink-0">{disco.formato_nome || '—'}</p>
      <p className="text-xs text-faint w-10 shrink-0 text-right">{disco.ano_lancamento || '—'}</p>
      <p className="flex items-center gap-1 text-xs text-amber-500 w-10 shrink-0 justify-end">
        {disco.avaliacao ? (
          <>
            <Star className="w-3 h-3 fill-amber-500" /> {disco.avaliacao}
          </>
        ) : (
          <span className="text-faint">—</span>
        )}
      </p>
    </Link>
  )
}
