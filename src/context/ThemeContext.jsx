import { createContext, useContext, useEffect, useState } from 'react'

export const ACCENTS = [
  { key: 'emerald', label: 'Esmeralda', color: '#0f8a5d' },
  { key: 'blue', label: 'Azul', color: '#2f5bd6' },
  { key: 'violet', label: 'Violeta', color: '#6b46e0' },
  { key: 'rose', label: 'Rosa', color: '#d63a67' },
  { key: 'amber', label: 'Âmbar', color: '#b1771a' },
  { key: 'cyan', label: 'Ciano', color: '#0e8ba6' },
  { key: 'orange', label: 'Laranja', color: '#c6552a' },
  { key: 'pink', label: 'Pink', color: '#c43e86' },
]

const ThemeContext = createContext(null)

function temaInicial() {
  const salvo = localStorage.getItem('tema')
  if (salvo === 'light' || salvo === 'dark') return salvo
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function accentInicial() {
  const salvo = localStorage.getItem('accent')
  return ACCENTS.some((a) => a.key === salvo) ? salvo : 'emerald'
}

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(temaInicial)
  const [accent, setAccent] = useState(accentInicial)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'dark')
    localStorage.setItem('tema', tema)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tema === 'dark' ? '#15120d' : '#ebe8df')
  }, [tema])

  useEffect(() => {
    document.documentElement.dataset.accent = accent
    localStorage.setItem('accent', accent)
  }, [accent])

  return (
    <ThemeContext.Provider value={{ tema, setTema, accent, setAccent, accents: ACCENTS }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme deve ser usado dentro de <ThemeProvider>')
  return ctx
}
