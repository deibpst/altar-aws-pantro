// POST /uploads -> URL firmada para subir (PUT). GET /uploads/{imageKey} -> URL firmada para ver.
import { randomUUID } from 'node:crypto'
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// WHEN_REQUIRED: sin esto la URL de PUT firma el checksum de un cuerpo vacio.
const s3 = new S3Client({ requestChecksumCalculation: 'WHEN_REQUIRED' })
const HEADERS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
const EXTENSIONES = { 'image/jpeg': 'jpeg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }

const responder = (statusCode, cuerpo) => ({ statusCode, headers: HEADERS, body: JSON.stringify(cuerpo) })

export const handler = async (event) => {
  const Bucket = process.env.BUCKET

  if (event.httpMethod === 'GET') {
    const Key = event.pathParameters?.proxy
    if (!Key) return responder(400, { error: 'Falta la imageKey.' })
    const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket, Key }), { expiresIn: 3600 })
    return responder(200, { url })
  }

  let cuerpo
  try {
    cuerpo = JSON.parse(event.body || '{}')
  } catch {
    return responder(400, { error: 'El cuerpo no es JSON.' })
  }
  const { altarId, contentType } = cuerpo
  if (!altarId) return responder(400, { error: 'Falta altarId.' })
  const ext = EXTENSIONES[contentType]
  if (!ext) return responder(400, { error: 'contentType debe ser jpeg, png, webp o gif.' })

  const imageKey = `${altarId}/${randomUUID()}.${ext}`
  const url = await getSignedUrl(s3, new PutObjectCommand({ Bucket, Key: imageKey, ContentType: contentType }), {
    expiresIn: 300,
  })
  return responder(200, { url, imageKey })
}
