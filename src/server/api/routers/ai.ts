import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
  ResponseTypes,
} from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";

// Instantiate OpenAI API
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const apiConfig = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const openai = new OpenAIApi(apiConfig);

export const aiRouter = createTRPCRouter({
  getChatStream: protectedProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.nativeEnum(ChatCompletionRequestMessageRoleEnum),
          })
        ),
      })
    )
    .subscription(async ({ input }) => {
      const messages = input.messages;

      // Request the OpenAI API for the response based on the prompt
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const response = (await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        stream: true,
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 1,
        presence_penalty: 1,
      })) as Response;

      // Convert the response into a friendly text-stream
      const stream = OpenAIStream(response);

      // Respond with the stream
      return new StreamingTextResponse(stream);
    }),
});
