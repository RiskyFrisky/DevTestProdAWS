import { beforeEach, test, expect } from 'bun:test';

import { handler } from '../../WorkerFunction/index';
import { Context } from 'aws-lambda';

import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
const ddbClientMock = mockClient(DynamoDBClient);

beforeEach(() => {
	ddbClientMock.reset();
	ddbClientMock.on(UpdateItemCommand).resolves({});
});

test('runs w/out error', async () => {
	const event = {
		Records: [
			{
				body: JSON.stringify({
					id: 'myId',
					color: 'red'
				})
			}
		]
	};
	const res = await handler(event, {} as Context, () => {});
	expect(res).toBeUndefined();
});
