import { Handler } from "aws-lambda";

import { rootPath } from "get-root-path";
const layerPath = "/opt/nodejs/dist";

const awsHelper = await import(
    process.env.NODE_ENV === "test"
        ? `${rootPath}/Lambda/Layer/nodejs/awsHelper.ts`
        : `${layerPath}/awsHelper.mjs`
);

export const handler: Handler = async (event) => {
    console.log(JSON.stringify(event, null, 2));

    const request = {
        path: event.requestContext.http.path,
        method: event.requestContext.http.method,
        query: event.queryStringParameters,
        body: event.body && JSON.parse(event.body)
    };
    const { path, method, query, body } = request;

    try {
        if (path == "/color") {
            if (method == "GET") {
                const { id } = query;

                const res = await awsHelper.getItem(
                    "devtestprodaws-database",
                    id
                );

                let color = null;
                if (res) {
                    color = res.color;
                }

                return {
                    statusCode: 200,
                    body: JSON.stringify({ color })
                };
            } else if (method == "POST") {
                const { id } = query;
                const { color } = body;

                await awsHelper.sendMessage(
                    "devtestprodaws-queue",
                    JSON.stringify({ id, color })
                );

                return {
                    statusCode: 202,
                    body: JSON.stringify({
                        message: "Request is being processed"
                    })
                };
            }
        }
    } catch (err) {}

    return {
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST",
            "Access-Control-Allow-Headers": "Content-Type"
        },
        statusCode: 400,
        body: JSON.stringify({ error: "Unknown command or missing params" })
    };
};
