import { Link } from 'react-router-dom'
import { Disc3, Star } from 'lucide-react'

export default function DiscoCard({ disco }) {
  return (
    <Link
      to={`/discos/${disco.id_disco}`}
      className="group bg-surface border border-border rounded-xl overflow-hidden hover:border-accent transition-colors flex flex-col"
    >
      <div className="aspect-square bg-surface-2 flex items-center justify-center overflow-hidden">
        {disco.url_capa ? (
          <img
            src={disco.url_capa}
            alt={disco.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <Disc3 className="w-10 h-10 text-faint" />
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col gap-1">
        <h3 className="font-medium text-sm leading-tight line-clamp-2">{disco.titulo}</h3>
        <p className="text-xs text-muted line-clamp-1">{disco.artista_nome || 'Artista desconhecido'}</p>
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-faint">
          <span>{disco.ano_lancamento || '—'}</span>
          {disco.avaliacao ? (
            <span className="flex items-center gap-1 text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" /> {disco.avaliacao}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
