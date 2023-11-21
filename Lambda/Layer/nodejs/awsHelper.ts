import {
    DynamoDBClient,
    GetItemCommand,
    UpdateItemCommand,
    GetItemCommandInput,
    UpdateItemCommandInput,
    AttributeValue
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { SQS, SendMessageCommand } from "@aws-sdk/client-sqs";
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import { EndpointV2 } from "@aws-sdk/types";

const config: any = {
    region: process.env.AWS_REGION ?? "us-east-1"
};
if (process.env.NODE_ENV !== "test") {
    config.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN
    };
}
if (process.env.LOCALSTACK_HOSTNAME) {
    const endpoint: EndpointV2 = {
        url: new URL(`http://${process.env.LOCALSTACK_HOSTNAME}:4566`)
    };
    config.endpoint = endpoint;
}

const ddbClient = new DynamoDBClient(config);
const sqsClient = new SQS(config);
const stsClient = new STSClient(config);

export const getItem = (table: string, primaryKey: string) => {
    const params: GetItemCommandInput = {
        TableName: table,
        Key: marshall({
            id: primaryKey
        })
    };
    return new Promise((resolve, reject) => {
        ddbClient.send(new GetItemCommand(params)).then(
            (data) => {
                if (data?.Item != null) {
                    resolve(unmarshall(data.Item));
                } else {
                    resolve(null);
                }
            },
            (err) => {
                console.error(err);
                reject(err);
            }
        );
    });
};

export const setItem = (
    table: string,
    primaryKey: string,
    UpdateExpression: string,
    ExpressionAttributeNames: Record<string, string>,
    ExpressionAttributeValues: Record<string, AttributeValue>
) => {
    const params: UpdateItemCommandInput = {
        TableName: table,
        Key: marshall({
            id: primaryKey
        }),
        UpdateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues: marshall(ExpressionAttributeValues),
        ReturnValues: "UPDATED_NEW"
    };
    return new Promise((resolve, reject) => {
        ddbClient.send(new UpdateItemCommand(params)).then(
            (data) => {
                if (data?.Attributes != null) {
                    resolve(unmarshall(data.Attributes));
                } else {
                    resolve(null);
                }
            },
            (err) => {
                console.error(err);
                reject(err);
            }
        );
    });
};

export const sendMessage = async (queue: string, message: string) => {
    const params = {
        QueueUrl: `https://sqs.us-east-1.amazonaws.com/${await getAWSAccountId()}/${queue}`,
        MessageBody: message
    };
    return new Promise((resolve, reject) => {
        sqsClient.send(new SendMessageCommand(params)).then(
            (data) => {
                resolve(data);
            },
            (err) => {
                console.error(err);
                reject(err);
            }
        );
    });
};

// https://stackoverflow.com/a/74546015/16762230
export const getAWSAccountId = async (): Promise<string> => {
    const response = await stsClient.send(new GetCallerIdentityCommand({}));
    return String(response.Account);
};
