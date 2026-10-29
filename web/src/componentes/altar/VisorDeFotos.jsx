// Preview en grande de las fotos del altar, sin salir de la pagina.
// `fotos` es la lista plana en orden de altar; `indice` la que se ve.

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import BotonCerrar from '../layout/BotonCerrar.jsx'

const UMBRAL_SWIPE = 50

function Flecha({ lado, onClick }) {
  const izq = lado === 'izq'
  return (
    <button
      type="button"
      className={`visor-flecha visor-${lado}`}
      aria-label={izq ? 'Foto anterior' : 'Foto siguiente'}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
        <path
          d={izq ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

export default function VisorDeFotos({ fotos, indice, onIndice, onCerrar }) {
  const n = fotos.length
  const foto = fotos[indice]
  const inicioX = useRef(null)
  const ir = (d) => onIndice((indice + d + n) % n)

  // Teclado y bloqueo de scroll mientras esta abierto.
  useEffect(() => {
    function alTeclear(e) {
      if (e.key === 'Escape') onCerrar()
      else if (n > 1 && e.key === 'ArrowLeft') ir(-1)
      else if (n > 1 && e.key === 'ArrowRight') ir(1)
    }
    window.addEventListener('keydown', alTeclear)
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', alTeclear)
      document.body.style.overflow = previo
    }
  })

  return createPortal(
    <div
      className="visor"
      role="dialog"
      aria-modal="true"
      aria-label="Foto en grande"
      onClick={onCerrar}
      onTouchStart={(e) => (inicioX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - inicioX.current
        if (n > 1 && Math.abs(dx) > UMBRAL_SWIPE) ir(dx < 0 ? 1 : -1)
      }}
    >
      <BotonCerrar className="visor-cerrar" etiqueta="Cerrar" onClick={onCerrar} />
      {n > 1 && <Flecha lado="izq" onClick={() => ir(-1)} />}
      <figure className="visor-figura" onClick={(e) => e.stopPropagation()}>
        <img src={foto.url} alt={foto.texto || foto.etiqueta} />
        <figcaption>
          {foto.texto || foto.etiqueta}
          {n > 1 && <span className="visor-cuenta"> · {indice + 1}/{n}</span>}
        </figcaption>
      </figure>
      {n > 1 && <Flecha lado="der" onClick={() => ir(1)} />}
    </div>,
    document.body,
  )
}
