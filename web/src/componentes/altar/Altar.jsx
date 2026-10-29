// Las tres gradas del altar.
//
// Arriba a quien recuerdas, en medio lo que le gustaba, abajo lo que
// necesita para el camino. El orden del arreglo NIVELES es el orden en que
// se dibujan, y el CSS las va ensanchando hacia abajo.

import { useState } from 'react'
import { NIVELES, etiquetaDe } from '../../catalogo/elementos.js'
import Grada from './Grada.jsx'
import VisorDeFotos from './VisorDeFotos.jsx'

/** Los elementos de una grada, en el orden en que se pusieron. */
function deLaGrada(elementos, nivel) {
  return elementos
    .filter((el) => el.nivel === nivel)
    .sort((a, b) => a.creadoEn.localeCompare(b.creadoEn))
}

export default function Altar({ elementos, imagenes, onQuitar }) {
  const [abierta, setAbierta] = useState(null) // indice en `fotos`, o null

  // Fotos en orden de altar: grada de arriba a abajo, de izquierda a derecha.
  // Las que aun se estan guardando no se abren.
  const fotos = NIVELES.flatMap(({ nivel }) => deLaGrada(elementos, nivel))
    .filter((el) => imagenes.has(el.id) && !el.pendiente)
    .map((el) => ({
      id: el.id,
      url: imagenes.get(el.id),
      texto: el.texto,
      etiqueta: etiquetaDe(el.tipo),
    }))

  // Si la foto abierta se quita, el indice puede quedar fuera de rango.
  const indice = abierta !== null && abierta < fotos.length ? abierta : null

  return (
    <div id="altar">
      {NIVELES.map(({ nivel, nombre, descripcion }) => (
        <Grada
          key={nivel}
          nombre={nombre}
          descripcion={descripcion}
          elementos={deLaGrada(elementos, nivel)}
          imagenes={imagenes}
          onQuitar={onQuitar}
          onAbrir={(id) => setAbierta(fotos.findIndex((f) => f.id === id))}
        />
      ))}
      {indice !== null && (
        <VisorDeFotos
          fotos={fotos}
          indice={indice}
          onIndice={setAbierta}
          onCerrar={() => setAbierta(null)}
        />
      )}
    </div>
  )
}
