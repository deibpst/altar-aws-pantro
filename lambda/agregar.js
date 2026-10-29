// POST /elements -> crea un elemento, o lo borra si el cuerpo trae { borrar: true, id }.
import { randomUUID } from 'node:crypto'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, DeleteCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const HEADERS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
const CAMPOS = ['tipo', 'nivel', 'texto', 'link', 'puestoPor', 'imageKey']

const responder = (statusCode, cuerpo) => ({ statusCode, headers: HEADERS, body: JSON.stringify(cuerpo) })

async function delAltar(altarId) {
  const { Items = [] } = await db.send(
    new QueryCommand({
      TableName: process.env.TABLA,
      KeyConditionExpression: 'altarId = :a',
      ExpressionAttributeValues: { ':a': altarId },
    }),
  )
  return Items
}

export const handler = async (event) => {
  let cuerpo
  try {
    cuerpo = JSON.parse(event.body || '{}')
  } catch {
    return responder(400, { error: 'El cuerpo no es JSON.' })
  }

  const { altarId } = cuerpo
  if (!altarId) return responder(400, { error: 'Falta altarId.' })

  if (cuerpo.borrar === true) {
    if (!cuerpo.id) return responder(400, { error: 'Falta id.' })
    const existente = (await delAltar(altarId)).find((el) => el.id === cuerpo.id)
    if (!existente) return responder(404, { error: 'Ese elemento no está en este altar.' })
    await db.send(new DeleteCommand({ TableName: process.env.TABLA, Key: { altarId, sk: existente.sk } }))
    return responder(200, { borrado: cuerpo.id })
  }

  if (!cuerpo.tipo) return responder(400, { error: 'Falta tipo.' })

  // Solo pasan los campos permitidos; id, creadoEn y posicion los pone el servidor.
  const permitidos = Object.fromEntries(CAMPOS.filter((c) => cuerpo[c] !== undefined).map((c) => [c, cuerpo[c]]))
  const nivel = permitidos.nivel ?? 1
  const posicion = (await delAltar(altarId)).filter((el) => el.nivel === nivel).length
  const id = randomUUID()
  const creadoEn = new Date().toISOString()
  const item = { ...permitidos, nivel, altarId, posicion, id, creadoEn, sk: `${creadoEn}#${id}` }

  await db.send(new PutCommand({ TableName: process.env.TABLA, Item: item }))
  const { sk, ...elemento } = item
  return responder(201, elemento)
}
