const groqBaseUrl = process.env.GROQ_BASE_URL;
const groqApiKey = process.env.GROQ_API_KEY;
const openAiBaseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const openAiApiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const groqModel = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const openAiModel = process.env.AI_INTEGRATIONS_OPENAI_MODEL || process.env.OPENAI_MODEL || "gpt-4.1-mini";

export const isGrokConfigured = Boolean(groqBaseUrl && groqApiKey);
export const isOpenAiConfigured = Boolean(openAiBaseUrl && openAiApiKey);

const providerOrder = (process.env.AI_PROVIDER_ORDER || "grok,openai")
  .split(",")
  .map((provider) => provider.trim().toLowerCase())
  .filter((provider): provider is "grok" | "openai" => provider === "grok" || provider === "openai");

function buildUrl(provider: "grok" | "openai", path: string) {
  if (provider === "grok") {
    if (!groqBaseUrl) {
      throw new Error("GROQ_BASE_URL is not configured.");
    }
    return `${groqBaseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  }

  if (!openAiBaseUrl) {
    throw new Error("AI_INTEGRATIONS_OPENAI_BASE_URL or OPENAI_BASE_URL is not configured.");
  }
  return `${openAiBaseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

function parseEventStreamLine(line: string) {
  const dataPrefix = "data:";
  if (!line.startsWith(dataPrefix)) return null;

  const payload = line.slice(dataPrefix.length).trim();
  if (!payload || payload === "[DONE]") return null;

  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

async function* streamAsyncIterator(response: Response) {
  if (!response.body) {
    throw new Error("No response body from AI provider.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const parsed = parseEventStreamLine(line.trim());
      if (parsed) yield parsed;
    }
  }

  const remaining = buffer.trim();
  if (remaining) {
    const parsed = parseEventStreamLine(remaining) ?? (remaining.startsWith("{") ? JSON.parse(remaining) : null);
    if (parsed) yield parsed;
  }
}

function buildProviderHeaders(provider: "grok" | "openai") {
  if (provider === "grok") {
    return {
      Authorization: `Bearer ${groqApiKey}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    };
  }

  return {
    Authorization: `Bearer ${openAiApiKey}`,
    "Content-Type": "application/json",
    Accept: "text/event-stream",
  };
}

function getConfiguredProviders() {
  return providerOrder.filter((provider) => {
    if (provider === "grok") return isGrokConfigured;
    return isOpenAiConfigured;
  });
}

async function fetchWithRetries(url: string, init: RequestInit, maxAttempts = 2) {
  let attempt = 0;
  let lastError: unknown;

  while (attempt < maxAttempts) {
    try {
      const response = await fetch(url, init);
      return response;
    } catch (err) {
      lastError = err;
      attempt += 1;
      if (attempt >= maxAttempts) break;
      const delayMs = 250 * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

async function createProviderCompletion(provider: "grok" | "openai", payload: any) {
  const url = buildUrl(provider, "chat/completions");
  const headers = buildProviderHeaders(provider);
  const providerPayload = {
    ...payload,
    model: provider === "grok" ? groqModel : openAiModel,
  };
  const response = await fetchWithRetries(
    url,
    {
      method: "POST",
      headers,
      body: JSON.stringify(providerPayload),
    },
    2,
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${provider === "grok" ? "Grok" : "OpenAI"} API request failed (${response.status}): ${body}`);
  }

  if (providerPayload.stream) {
    return streamAsyncIterator(response) as AsyncGenerator<any, void, unknown>;
  }

  return response.json();
}

export const openai = {
  chat: {
    completions: {
      create: async (payload: any) => {
        const providers = getConfiguredProviders();
        if (providers.length === 0) {
          throw new Error(
            "No AI provider is configured. Set GROQ_BASE_URL/GROQ_API_KEY for Grok or AI_INTEGRATIONS_OPENAI_BASE_URL/AI_INTEGRATIONS_OPENAI_API_KEY for OpenAI.",
          );
        }

        const errors: Error[] = [];
        for (const provider of providers) {
          try {
            return await createProviderCompletion(provider, payload);
          } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            errors.push(error);
            console.warn(`${provider} provider failed:`, error.message);
          }
        }

        throw new Error(`All AI providers failed: ${errors.map((e) => e.message).join(" | ")}`);
      },
    },
  },
};
