import { createContext, useContext, useEffect, useState } from 'react'

export const ACCENTS = [
  { key: 'emerald', label: 'Esmeralda', color: '#10b981' },
  { key: 'blue', label: 'Azul', color: '#3b82f6' },
  { key: 'violet', label: 'Violeta', color: '#8b5cf6' },
  { key: 'rose', label: 'Rosa', color: '#f43f5e' },
  { key: 'amber', label: 'Âmbar', color: '#f59e0b' },
  { key: 'cyan', label: 'Ciano', color: '#06b6d4' },
  { key: 'orange', label: 'Laranja', color: '#f97316' },
  { key: 'pink', label: 'Pink', color: '#ec4899' },
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
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tema === 'dark' ? '#0a0a0a' : '#fafafa')
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
