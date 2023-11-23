import { describe, test, expect, beforeAll } from "bun:test";

import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const lambda = new LambdaClient({
    endpoint: process.env.LOCALSTACK_HOSTNAME
        ? `http://${process.env.LOCALSTACK_HOSTNAME}:4566`
        : "http://localhost.localstack.cloud:4566",
    tls: false,
    region: "us-east-1",
    credentials: {
        accessKeyId: "any",
        secretAccessKey: "any"
    }
});
const invoke = async (funcName: string, payload: any) => {
    const command = new InvokeCommand({
        FunctionName: funcName,
        Payload: JSON.stringify(payload)
    });
    const ret = await lambda.send(command);
    const { Payload, StatusCode } = ret;
    if (Payload != undefined) {
        const result = Buffer.from(Payload).toString();
        const payload = JSON.parse(result);
        return payload;
    } else {
        return {
            statusCode: StatusCode
        };
    }
};

describe("Lambda invoke integration tests", () => {
    let color: string;
    beforeAll(() => {
        console.log("url:", process.env.FUNCTION_URL);

        const colors = [
            "red",
            "green",
            "blue",
            "purple",
            "yellow",
            "orange",
            "black",
            "white"
        ];
        const randomIndex = Math.floor(Math.random() * colors.length);
        color = colors[randomIndex];

        console.log("color:", color);
    });

    test("POST /color", async () => {
        const event = {
            requestContext: {
                http: {
                    path: "/color",
                    method: "POST"
                }
            },
            queryStringParameters: {
                id: "myId"
            },
            body: JSON.stringify({ color })
        };
        const result = await invoke("devtestprodaws-main", event);
        console.log(result);

        const { body: bodyString, statusCode } = result;
        const body = JSON.parse(bodyString);

        expect(statusCode).toEqual(202);
        expect(body).toHaveProperty("message");
    }, 10000);

    test("GET /color", async () => {
        // Delay the test execution for 2 seconds to give time for SQS to trigger Worker Lambda
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const event = {
            requestContext: {
                http: {
                    path: "/color",
                    method: "GET"
                }
            },
            queryStringParameters: {
                id: "myId"
            }
        };
        const result = await invoke("devtestprodaws-main", event);
        console.log(result);

        const { body: bodyString, statusCode } = result;
        const body = JSON.parse(bodyString);

        expect(statusCode).toEqual(200);
        expect(body).toHaveProperty("color");
        expect(body.color).toEqual(color);
    }, 10000);
});
