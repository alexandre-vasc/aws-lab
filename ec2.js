const AWS = require('aws-sdk');

// Configure AWS SDK with your credentials and region
AWS.config.update({ region: 'us-east-2' });

// Create an SQS and DynamoDB service object
const sqs = new AWS.SQS();

// Create a DynamoDB service object
const dynamoDB = new AWS.DynamoDB();

const SQS_QUEUE_URL =  process.env.SQS_QUEUE_URL;
const DYNAMO_TABLE = process.env.DYNAMO_TABLE

// Function to process SQS messages
async function processMessages() {
    try {
        // Receive messages from the SQS queue
        const data = await sqs.receiveMessage({
            QueueUrl: SQS_QUEUE_URL,
            MaxNumberOfMessages: 1, 
            WaitTimeSeconds: 20
        }).promise();

        if (data.Messages) {
            // Process each received message
            for (const message of data.Messages) {
                // Extract message body
                const body = JSON.parse(message.Body);

                // Process the message
                console.log('Processing message:', body);
                const processedOutput = processNumber(body.number)

                console.log('processed: ', processedOutput)
                console.log('requestID:', body.requestId)
                console.log('updating ', DYNAMO_TABLE)
                // Update DynamoDB table                
                await dynamoDB.updateItem({
                    TableName: DYNAMO_TABLE,
                    Key: {
                        'request_id': { N: body.requestId.toString() }
                    },
                    UpdateExpression: 'SET #attrName = :attrValue, #attrName2 = :attrValue2',
                    ExpressionAttributeNames: {
                        '#attrName': 'output',
                        '#attrName2': 'completed'
                    },
                    ExpressionAttributeValues: {
                        ':attrValue': { N: processedOutput.toString() },
                        ':attrValue2': { S: 'true'}
                    }
                }).promise();

                // Delete the processed message from the queue
                await sqs.deleteMessage({
                    QueueUrl: SQS_QUEUE_URL,
                    ReceiptHandle: message.ReceiptHandle
                }).promise();
            }
        }
    } catch (error) {
        console.error('Error processing messages:', error);
    }
}

// Loop to continuously process SQS messages
async function main() {
    while (true) {
        await processMessages();
    }
}

// process the number
function processNumber(number) {
    console.log("calculating prime for: ", number)
    let primeCount = 0;
    let foundPrime = 0;
    let useless = 0
    for (let n = 2; primeCount < number; n++) {
        if (isPrime(n)) {
            primeCount++;
            foundPrime = n;
        }
        for (let i = 0; i < 100; i++) {
            useless = i + 3
        }
    }
    return foundPrime;
}

function isPrime(n) {
    for (let i = 2; i < n; i++) {
        if (n%i==0)
            return false;
    }
    return true;
}

main().catch(error => console.error('An error occurred:', error));