// pages/api/chat.tsx

import type { NextRequest } from "next/server";

import {
  type ChatCompletionResponseMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";

export const config = {
  runtime: "experimental-edge",
};

const apiConfig = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(apiConfig);

export default async function AIChatStream(req: NextRequest) {
  try {
    // Extract the `messages` from the body of the request
    const reqJSON = (await req.json()) as {
      messages: {
        role: ChatCompletionResponseMessageRoleEnum;
        content: string;
      }[];
    };
    console.log("Request: ", reqJSON);

    // eslint-disable-next-line @typescript-eslint/await-thenable
    const messages = reqJSON.messages;
    console.log("Messages: ", messages);

    if (!messages) {
      return new Response("No messages provided", { status: 400 });
    }

    // Request the OpenAI API for the response based on the prompt
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: messages,
      max_tokens: 500,
      frequency_penalty: 1,
      presence_penalty: 1,
    });
    console.log("Response: ", response);
    if (!response) {
      return new Response("No response from OpenAI", { status: 500 });
    }

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response);
    console.log("Stream: ", stream);
    if (!stream) {
      return new Response("No stream from OpenAI", { status: 500 });
    }

    // Convert the stream into a friendly response
    const streamingTextResponse = new StreamingTextResponse(stream);
    console.log("StreamingTextResponse: ", streamingTextResponse);
    if (!streamingTextResponse) {
      return new Response("No streamingTextResponse from OpenAI", {
        status: 500,
      });
    }
    // Respond with the stream
    return streamingTextResponse;
  } catch (err) {
    const errors = err as string[];
    console.log("Error: ", errors);
    return new Response(errors[0] ?? "Unknown error", {
      status: 500,
      statusText: errors[0] ?? "Unknown error",
    });
  }
}
