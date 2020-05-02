import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import {getUserId} from '../utils';
const docClient = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3({
  signatureVersion: 'v4'
});

const todoTable = process.env.TODO_TABLE;
const bucketName = process.env.IMAGES_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event);
  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  const uploadUrl = getUploadUrl(todoId);
  const imageUrl =  `https://${bucketName}.s3.amazonaws.com/${todoId}`;

  await docClient.update({
    TableName: todoTable,
    Key: {
      "userId": userId,
      "todoId": todoId
    },
    UpdateExpression: "set #itemUrl = :todoAttachmentUrl",
    ExpressionAttributeValues: {
      ':todoAttachmentUrl' : imageUrl
    },
    ExpressionAttributeNames:{
      '#itemUrl': 'attachmentUrl'
    }
  }).promise();

  return {
    statusCode: 200,
    headers:{
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl
    })
  }
}

function getUploadUrl(todoId: string){
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  });
}