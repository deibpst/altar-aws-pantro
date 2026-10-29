// El x de las pills y del visor de fotos.

export default function BotonCerrar({ onClick, etiqueta, className = '' }) {
  return (
    <button
      type="button"
      className={`boton-cerrar ${className}`}
      aria-label={etiqueta}
      title={etiqueta}
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </button>
  )
}
