import OpenAI from "openai";

const openAiBaseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
const openAiApiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

export const isOpenAiConfigured = Boolean(openAiBaseUrl && openAiApiKey);

export const openai = isOpenAiConfigured
  ? new OpenAI({
      apiKey: openAiApiKey,
      baseURL: openAiBaseUrl,
    })
  : ({
      chat: {
        completions: {
          create: async () => {
            throw new Error(
              "OpenAI integration is not configured. Set AI_INTEGRATIONS_OPENAI_BASE_URL and AI_INTEGRATIONS_OPENAI_API_KEY.",
            );
          },
        },
      },
    } as const);
