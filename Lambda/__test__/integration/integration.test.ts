import { describe, test, expect, beforeAll } from "bun:test";

describe("Integration tests", () => {
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
            "white",
        ];
        const randomIndex = Math.floor(Math.random() * colors.length);
        color = colors[randomIndex];

        console.log("color:", color);
    });

    test("POST /color", async () => {
        const res: Response = await fetch(
            `${process.env.FUNCTION_URL}color?id=myId`,
            {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify({ color }),
            }
        );

        console.log("res:", res);
        console.log("body:", await res.text());

        // const ok = res.ok;
        // const statusCode = res.status; // localstack returns 200 instead of 202
        // const body = await res.json();

        // expect(ok).toEqual(true);
        // expect(body).toHaveProperty("message");
    });

    test("GET /color", async () => {
        // Delay the test execution for 2 seconds to give time for SQS to trigger Worker Lambda
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const res: Response = await fetch(
            `${process.env.FUNCTION_URL}color?id=myId`
        );

        console.log("res:", res);
        console.log("body:", await res.text());

        // const statusCode = res.status;
        // const body = await res.json();

        // expect(statusCode).toEqual(200);
        // expect(body).toHaveProperty("color");
        // expect(body.color).toEqual(color);
    });
});
