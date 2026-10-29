// El pie de la pagina: cuantas cosas tiene el altar y cuando se publico.

import { useState } from 'react'
import { cuandoSeConstruyo } from '../../lib/build.js'
import BotonCerrar from './BotonCerrar.jsx'

function cuantas(n) {
  return n === 1 ? '1 elemento' : `${n} elementos`
}

export default function PieDePagina({ total }) {
  const [visible, setVisible] = useState(true)
  return (
    <footer>
      {visible && (
        <p className="pie-pill">
          <span>
            {cuantas(total)} · Ofrenda en la Nube · {cuandoSeConstruyo()}
          </span>
          <BotonCerrar etiqueta="Cerrar" onClick={() => setVisible(false)} />
        </p>
      )}
    </footer>
  )
}
