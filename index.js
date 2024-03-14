// lambda code
const AWS = require('aws-sdk');
const sqs = new AWS.SQS();

const SQS_QUEUE_URL =  process.env.SQS_QUEUE_URL;
const DYNAMO_TABLE = process.env.DYNAMO_TABLE

module.exports.handler = async (event) => {
    try {
        const requestBody = JSON.parse(event.body);
        const number = requestBody.number;
        const requestId = Math.random() * Number.MAX_SAFE_INTEGER;
        const nowUnixTime = Math.floor(Date.now() / 1000);

        const dynamoDB = new AWS.DynamoDB.DocumentClient();
        const dbParams = {
            TableName: DYNAMO_TABLE,
            Item: {
                // Table collums
                request_id: requestId,
                input: number,
                output: 0,
                completed: false,
                created_time: nowUnixTime,
                updated_time: nowUnixTime,

                // lets implement this one later!
                user_id: 1
            }
        };     
        const messageParams = {
            MessageBody: JSON.stringify({ number, requestId }),
            QueueUrl: SQS_QUEUE_URL,
        };

        await Promise.all([
            dynamoDB.put(dbParams).promise(),
            sqs.sendMessage(messageParams).promise()
        ])

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Number will be processed on the background and will be available in some minutes' }),
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
        };
    }
};