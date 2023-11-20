import { Handler } from 'aws-lambda';

import { rootPath } from 'get-root-path';
const layerPath = '/opt/nodejs/dist';

const awsHelper =
	process.env.NODE_ENV === 'test'
		? await import(`${rootPath}/Lambda/Layer/nodejs/awsHelper.ts`)
		: await import(`${layerPath}/awsHelper.mjs`);

import assert from 'assert';

export const handler: Handler = async (event) => {
	console.log(JSON.stringify(event, null, 2));

	const body = JSON.parse(event.Records[0].body);

	const { id, color } = body;
	assert(id && color, 'id and color are required');

	// set ttl for 1 hour
	const date = new Date();
	date.setHours(date.getHours() + 1);
	const ttl = Math.round(date.getTime() / 1000);

	await awsHelper.setItem(
		'devtestprodaws-database',
		id,
		`SET #color=:color, #ttl=:ttl`,
		{
			'#color': `color`,
			'#ttl': `ttl`
		},
		{
			':color': color,
			':ttl': ttl
		}
	);
};
