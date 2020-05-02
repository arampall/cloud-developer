import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import {getUserId} from '../utils';
const docClient = new AWS.DynamoDB.DocumentClient();

const todoTable = process.env.TODO_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event);
  // TODO: Remove a TODO item by id
  console.log('Removing Item with Id ', todoId);

  await docClient.delete({
    TableName: todoTable,
    Key: {
      userId,
      todoId
    }
  }).promise();

  console.log('Deleted the TODO item with id ', todoId);

  return {
    statusCode: 200,
    headers:{
      'Access-Control-Allow-Origin': '*'
    },
    body: null
  }
}
