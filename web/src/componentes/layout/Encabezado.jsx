// El encabezado del altar.
//
// El nombre de quien lo arma va aqui, no en el formulario de agregar
// elementos: es de la persona, no de la vela. Se escribe una vez y se
// queda.

export default function Encabezado({ nombre, onNombre }) {
  return (
    <header>
      <p className="encabezado-eyebrow">Día de Muertos</p>
      <h1>
        Ofrenda para <span>Pantro</span>
      </h1>
    </header>
  )
}
