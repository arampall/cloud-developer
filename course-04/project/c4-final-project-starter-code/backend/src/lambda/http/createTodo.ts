import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as uuid from 'uuid'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { TodoItem } from '../../models/TodoItem';
import {getUserId} from '../utils';

const docClient = new AWS.DynamoDB.DocumentClient();

const todoTable = process.env.TODO_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  console.log('Event ', event.body);
  // TODO: Implement creating a new TODO item
  console.log('Starting to create TODO item');
  const userId: string = getUserId(event);
  const todoId: string = uuid.v4();
  const createdAt: string = new Date().toISOString();
  const newItem: TodoItem = {
    userId,
    todoId,
    createdAt,
    done: false,
    ...newTodo    
  }

  console.log('New Todo Item is here', newItem);

  await docClient.put({
    TableName: todoTable,
    Item: newItem
  }).promise();

  return {
    statusCode: 201,
    headers:{
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      item: {
        todoId: newItem.todoId,
        createdAt: newItem.createdAt,
        name: newItem.name,
        dueDate: newItem.dueDate,
        done: newItem.done
      }
      
    })
  }
}
