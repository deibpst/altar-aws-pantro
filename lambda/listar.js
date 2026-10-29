// GET /elements?altarId=... -> { elementos: [...] } en el orden en que se pusieron.
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const HEADERS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }

const responder = (statusCode, cuerpo) => ({ statusCode, headers: HEADERS, body: JSON.stringify(cuerpo) })

export const handler = async (event) => {
  const altarId = event.queryStringParameters?.altarId
  if (!altarId) return responder(400, { error: 'Falta altarId.' })

  // Query por la partition key: solo toca los elementos de este altar.
  const { Items = [] } = await db.send(
    new QueryCommand({
      TableName: process.env.TABLA,
      KeyConditionExpression: 'altarId = :a',
      ExpressionAttributeValues: { ':a': altarId },
      ScanIndexForward: true,
      Limit: 200,
    }),
  )
  return responder(200, { elementos: Items.map(({ sk, ...elemento }) => elemento) })
}
