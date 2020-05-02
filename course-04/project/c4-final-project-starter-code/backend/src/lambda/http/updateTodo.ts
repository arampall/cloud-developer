import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import {getUserId} from '../utils';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

const docClient = new AWS.DynamoDB.DocumentClient();

const todoTable = process.env.TODO_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId: String = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  const userId: String = getUserId(event);
  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  await docClient.update({
    TableName: todoTable,
    Key: {
      "userId": userId,
      "todoId": todoId
    },
    UpdateExpression: "set #itemName = :todoName, #itemDueDate = :todoDueDate, #itemDone = :todoDone",
    ExpressionAttributeValues: {
      ':todoName' : updatedTodo.name,
      ':todoDueDate' : updatedTodo.dueDate,
      ':todoDone' : updatedTodo.done
    },
    ExpressionAttributeNames:{
      '#itemName': 'name',
      '#itemDueDate': 'dueDate',
      '#itemDone':'done'
    }
  }).promise();
  
  return {
    statusCode: 200,
    headers:{
      'Access-Control-Allow-Origin': '*'
    },
    body:null
  }
}
