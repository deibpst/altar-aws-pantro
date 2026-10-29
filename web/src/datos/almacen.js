// Donde se guarda el altar.
//
// Desde el modulo 3 el altar vive en tu propia API (API Gateway + Lambda +
// DynamoDB, con las imagenes en S3). Es el unico archivo que sabe eso: las
// cuatro funciones conservan su firma y siguen siendo async, asi que los
// componentes no cambiaron.
//
// El altar se identifica con el hostname de la pagina: la laptop y el
// telefono abren la misma URL de Amplify, asi que consultan el mismo altar.

import { reducirABlob } from '../lib/imagen.js'

// El modo esta escrito aqui como un dato, no deducido de la configuracion:
// el banner tiene que decir lo que ESTE archivo hace de verdad.
export const MODO = 'nube'

// Sin diagonal final, venga como venga en la variable.
const API = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')
const ALTAR_ID = window.location.hostname

const LLAVE_LOCAL = 'ofrenda:elementos'
const LLAVE_MIGRADO = 'ofrenda:migrado'
const LLAVE_NOMBRE = 'ofrenda:nombre'

async function llamar(ruta, opciones) {
  if (!API) throw new Error('Falta VITE_API_URL: no sé a qué API hablarle.')
  const res = await fetch(`${API}${ruta}`, opciones)
  const cuerpo = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(cuerpo.error || `La API respondió ${res.status}.`)
  return cuerpo
}

const post = (ruta, cuerpo) =>
  llamar(ruta, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
  })

/** Sube un Blob de imagen a S3 con una URL firmada y devuelve su imageKey. */
async function subirImagen(blob) {
  const { url, imageKey } = await post('/uploads', { altarId: ALTAR_ID, contentType: blob.type })
  const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': blob.type }, body: blob })
  if (!res.ok) throw new Error('No pude subir la imagen.')
  return imageKey
}

/**
 * Primera carga desde la laptop: si la API esta vacia, sube lo que el altar
 * tenia en localStorage (imagenes incluidas). Se hace una sola vez por navegador.
 */
async function migrarLocal() {
  let locales
  try {
    if (localStorage.getItem(LLAVE_MIGRADO)) return false
    locales = JSON.parse(localStorage.getItem(LLAVE_LOCAL) || '[]')
  } catch {
    return false
  }
  if (!Array.isArray(locales) || locales.length === 0) return false

  // En orden, para que los creadoEn que pone la API respeten el orden original.
  for (const { id, creadoEn, imagenLocal, imageKey, ...resto } of locales) {
    const datos = { ...resto, altarId: ALTAR_ID }
    if (imagenLocal) datos.imageKey = await subirImagen(await (await fetch(imagenLocal)).blob())
    await post('/elements', datos)
  }
  localStorage.setItem(LLAVE_MIGRADO, '1')
  return true
}

/** Todos los elementos del altar, ordenados por cuando se pusieron. */
export async function listar() {
  const pedir = () => llamar(`/elements?altarId=${encodeURIComponent(ALTAR_ID)}`)
  let { elementos } = await pedir()
  if (elementos.length === 0 && (await migrarLocal())) ({ elementos } = await pedir())
  return elementos
}

/**
 * Agrega un elemento y devuelve como quedo guardado.
 * Si trae `imagen` (el File del formulario), se reduce y se sube a S3; en el
 * elemento solo queda su `imageKey`.
 */
export async function agregar(elemento) {
  const { imagen, ...resto } = elemento
  const datos = { ...resto, altarId: ALTAR_ID }
  if (imagen) datos.imageKey = await subirImagen(await reducirABlob(imagen))
  return post('/elements', datos)
}

/** Quita un elemento del altar. */
export async function borrar(id) {
  await post('/elements', { altarId: ALTAR_ID, borrar: true, id })
}

/** URL firmada (1 hora) de la imagen del elemento, o null si no tiene. */
export async function urlDeImagen(elemento) {
  if (!elemento.imageKey) return null
  const { url } = await llamar(`/uploads/${elemento.imageKey}`)
  return url
}

/** Quien esta poniendo cosas en el altar. Se pregunta una sola vez. */
export function nombre() {
  return localStorage.getItem(LLAVE_NOMBRE) || ''
}

export function guardarNombre(valor) {
  localStorage.setItem(LLAVE_NOMBRE, valor.slice(0, 40))
}
