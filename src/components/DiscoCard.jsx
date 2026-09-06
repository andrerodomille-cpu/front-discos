import { Link } from 'react-router-dom'
import { Disc3, Star } from 'lucide-react'

export default function DiscoCard({ disco }) {
  return (
    <Link to={`/discos/${disco.id_disco}`} className="group flex flex-col">
      <div className="u-sleeve relative aspect-square flex items-center justify-center overflow-hidden">
        {disco.url_capa ? (
          <img
            src={disco.url_capa}
            alt={disco.titulo}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <Disc3 className="h-9 w-9 text-border-strong" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 pt-2">
        <h3 className="font-display text-[0.9375rem] font-semibold leading-tight tracking-[-0.01em] line-clamp-2 decoration-accent decoration-2 underline-offset-2 group-hover:underline">
          {disco.titulo}
        </h3>
        <p className="text-[0.8125rem] text-muted line-clamp-1">{disco.artista_nome || 'Artista desconhecido'}</p>
        <div className="mt-1 flex items-center justify-between text-xs text-faint">
          <span className="tabular-nums">{disco.ano_lancamento || '—'}</span>
          {disco.avaliacao ? (
            <span className="flex items-center gap-1 text-amber-500">
              <Star className="h-3 w-3 fill-amber-500" /> {disco.avaliacao}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
