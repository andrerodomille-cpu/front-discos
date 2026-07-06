import { Mic2, Tag, Building2, Disc, Users, Guitar, Store } from 'lucide-react'

export const ENTIDADES = {
  artistas: { label: 'Artistas', singular: 'Artista', endpoint: '/artistas', idField: 'id_artista', icon: Mic2 },
  generos: { label: 'Gêneros', singular: 'Gênero', endpoint: '/generos', idField: 'id_genero', icon: Tag },
  gravadoras: { label: 'Gravadoras', singular: 'Gravadora', endpoint: '/gravadoras', idField: 'id_gravadora', icon: Building2 },
  formatos: { label: 'Formatos', singular: 'Formato', endpoint: '/formatos', idField: 'id_formato', icon: Disc },
  musicos: { label: 'Músicos', singular: 'Músico', endpoint: '/musicos', idField: 'id_musico', icon: Users },
  instrumentos: { label: 'Instrumentos', singular: 'Instrumento', endpoint: '/instrumentos', idField: 'id_instrumento', icon: Guitar },
  lojas: { label: 'Lojas', singular: 'Loja', endpoint: '/lojas', idField: 'id_loja', icon: Store },
}

export const GRAUS_CONSERVACAO = ['Mint (M)', 'Near Mint (NM)', 'Very Good Plus (VG+)', 'Very Good (VG)', 'Good Plus (G+)', 'Good (G)', 'Poor (P)']
