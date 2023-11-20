import { beforeEach, test, expect } from 'bun:test';

import { handler } from '../../MainFunction/index';
import { Context } from 'aws-lambda';

import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { SQS, SendMessageCommand } from '@aws-sdk/client-sqs';
import { mockClient } from 'aws-sdk-client-mock';
const ddbClientMock = mockClient(DynamoDBClient);
const sqsClientMock = mockClient(SQS);

beforeEach(() => {
	ddbClientMock.reset();
	sqsClientMock.reset();
});

test('GET /color', async () => {
	ddbClientMock
		.on(GetItemCommand, {
			TableName: 'devtestprodaws-database'
		})
		.resolves({
			Item: marshall({
				id: 'myId',
				color: 'red'
			})
		});

	const event = {
		requestContext: {
			http: {
				path: '/color',
				method: 'GET'
			}
		},
		queryStringParameters: {
			id: 'myId'
		}
	};
	const res = await handler(event, {} as Context, () => {});
	expect(res.statusCode).toEqual(200);
});

test('POST /color', async () => {
	sqsClientMock.on(SendMessageCommand).resolves({});

	const event = {
		requestContext: {
			http: {
				path: '/color',
				method: 'POST'
			}
		},
		queryStringParameters: {
			id: 'myId'
		},
		body: JSON.stringify({ color: 'red' })
	};
	const res = await handler(event, {} as Context, () => {});
	expect(res.statusCode).toEqual(202);
});
