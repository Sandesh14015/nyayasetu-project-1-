const groqBaseUrl = process.env.GROQ_BASE_URL;
const groqApiKey = process.env.GROQ_API_KEY;

export const isGrokConfigured = Boolean(groqBaseUrl && groqApiKey);
export const isOpenAiConfigured = isGrokConfigured;

function buildUrl(path: string) {
  if (!groqBaseUrl) {
    throw new Error("GROQ_BASE_URL is not configured.");
  }
  return `${groqBaseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
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
    throw new Error("No response body from Groq API.");
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

export const openai = isOpenAiConfigured
  ? {
      chat: {
        completions: {
          create: async (payload: any) => {
            const url = buildUrl("chat/completions");
            const response = await fetch(url, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${groqApiKey}`,
                "Content-Type": "application/json",
                Accept: payload.stream ? "text/event-stream" : "application/json",
              },
              body: JSON.stringify(payload),
            });

            if (!response.ok) {
              const body = await response.text();
              throw new Error(`Grok API request failed (${response.status}): ${body}`);
            }

            if (payload.stream) {
              return streamAsyncIterator(response) as AsyncGenerator<any, void, unknown>;
            }

            return response.json();
          },
        },
      },
    }
  : ({
      chat: {
        completions: {
          create: async () => {
            throw new Error(
              "Grok integration is not configured. Set GROQ_BASE_URL and GROQ_API_KEY.",
            );
          },
        },
      },
    } as const);
