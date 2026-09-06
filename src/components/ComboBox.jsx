import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronsUpDown, Check } from 'lucide-react'

const inputClass = 'u-field pr-9'

/**
 * Combo com autopreenchimento. As opções são filtradas conforme o texto digitado.
 *
 * @param {{value:string|number,label:string}[]} options
 * @param {string|number} value
 * @param {(value:string) => void} onChange
 */
export default function ComboBox({ options, value, onChange, placeholder = 'Selecione...', id }) {
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const [destaque, setDestaque] = useState(0)
  const wrapperRef = useRef(null)

  const selecionado = options.find((o) => String(o.value) === String(value)) || null

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return options
    return options.filter((o) => o.label.toLowerCase().includes(termo))
  }, [options, busca])

  useEffect(() => {
    function aoClicarFora(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setAberto(false)
        setBusca('')
      }
    }
    document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [])

  useEffect(() => {
    setDestaque(0)
  }, [busca, aberto])

  const escolher = (opcao) => {
    onChange(String(opcao.value))
    setAberto(false)
    setBusca('')
  }

  const aoTeclar = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!aberto) setAberto(true)
      setDestaque((d) => Math.min(d + 1, filtradas.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setDestaque((d) => Math.max(d - 1, 0))
    } else if (e.key === 'Enter') {
      if (aberto && filtradas[destaque]) {
        e.preventDefault()
        escolher(filtradas[destaque])
      }
    } else if (e.key === 'Escape') {
      setAberto(false)
      setBusca('')
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        id={id}
        type="text"
        className={inputClass}
        placeholder={placeholder}
        value={aberto ? busca : selecionado?.label ?? ''}
        onChange={(e) => {
          setBusca(e.target.value)
          if (!aberto) setAberto(true)
        }}
        onFocus={() => setAberto(true)}
        onKeyDown={aoTeclar}
        autoComplete="off"
        role="combobox"
        aria-expanded={aberto}
      />
      <ChevronsUpDown className="w-4 h-4 text-faint absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />

      {aberto && (
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-[3px] border border-border-strong bg-surface py-1 shadow-lg">
          {filtradas.length === 0 && (
            <li className="px-3 py-2 text-sm text-faint">Nenhum resultado</li>
          )}
          {filtradas.map((opcao, i) => {
            const ativo = String(opcao.value) === String(value)
            return (
              <li
                key={opcao.value}
                onMouseDown={(e) => {
                  e.preventDefault()
                  escolher(opcao)
                }}
                onMouseEnter={() => setDestaque(i)}
                className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer ${
                  i === destaque ? 'bg-accent/10' : ''
                }`}
              >
                <Check className={`w-4 h-4 shrink-0 ${ativo ? 'text-accent' : 'opacity-0'}`} />
                <span className="truncate">{opcao.label}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
