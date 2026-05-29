import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, dbConnected, conversations, messages } from "@workspace/db";
import {
  CreateOpenaiConversationBody,
  GetOpenaiConversationParams,
  DeleteOpenaiConversationParams,
  ListOpenaiMessagesParams,
  SendOpenaiMessageParams,
  SendOpenaiMessageBody,
} from "@workspace/api-zod";
import * as integrations from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

const devConversations: Array<{ id: number; title: string; createdAt: string }> = [];
const devMessages: Array<{
  id: number;
  conversationId: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}> = [];
let devNextConversationId = 1;
let devNextMessageId = 1;

function getDevConversation(id: number) {
  return devConversations.find((conversation) => conversation.id === id);
}

function getDevMessages(conversationId: number) {
  return devMessages
    .filter((message) => message.conversationId === conversationId)
    .sort((a, b) => a.id - b.id);
}

type DevMessageRole = "user" | "assistant";

function createDevConversation(title: string) {
  const conversation = {
    id: devNextConversationId++,
    title,
    createdAt: new Date().toISOString(),
  };
  devConversations.push(conversation);
  return conversation;
}

function createDevMessage(conversationId: number, role: DevMessageRole, content: string) {
  const message = {
    id: devNextMessageId++,
    conversationId,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
  devMessages.push(message);
  return message;
}

const SYSTEM_PROMPT = `You are NyayaSetu AI, an intelligent legal assistant developed for India's Department of Justice. You help citizens understand the Indian judicial system, court procedures, case tracking, legal aid, eFiling, ePay services, and general legal queries.

Key responsibilities:
- Explain court procedures and legal processes in simple, accessible language
- Guide users on how to check case status on eCourts
- Explain eFiling and ePay services on the National eCourts portal
- Provide information about free legal aid and Tele-Law services
- Explain National Judicial Data Grid (NJDG) data and statistics
- Help citizens understand their legal rights
- Guide users to the right courts and legal resources
- Explain Fast Track Courts, Lok Adalats, and alternative dispute resolution

Official eCourts service links — always share these when relevant:
- Case Status (by CNR, party name, FIR, advocate): https://services.ecourts.gov.in/ecourtindia_v6/
- eFiling (file cases online): https://efiling.ecourts.gov.in/
- ePay (pay court fees electronically): https://pay.ecourts.gov.in/
- Cause List (daily hearing schedules): https://services.ecourts.gov.in/ecourtindia_v6/
- Judgments & Orders: https://services.ecourts.gov.in/ecourtindia_v6/
- NJDG (judicial data): https://njdg.ecourts.gov.in/
- Tele-Law (free legal advice via video): https://doj.gov.in/legal-aid/tele-law/
- NALSA (National Legal Services Authority — free legal aid): https://nalsa.gov.in/
- eCourts homepage: https://ecourts.gov.in/

When a user asks how to check their case, always guide them to https://services.ecourts.gov.in/ecourtindia_v6/ and explain the search options (CNR number, case number, party name, advocate name, act, FIR number).

Always be empathetic, clear, and supportive. Avoid complex legal jargon. Provide practical step-by-step guidance when possible. When you cannot answer a specific case query (since you don't have access to live case data), direct users to the official eCourts portal with the relevant link.

Important: You represent the Department of Justice and must maintain a professional, trustworthy tone at all times.`;

router.get("/openai/conversations", async (_req, res): Promise<void> => {
  if (!dbConnected || !db) {
    res.json(devConversations);
    return;
  }

  const rows = await db.select().from(conversations).orderBy(conversations.createdAt);
  res.json(
    rows.map((c) => ({
      id: c.id,
      title: c.title,
      createdAt: c.createdAt,
    }))
  );
});

router.post("/openai/conversations", async (req, res): Promise<void> => {
  const parsed = CreateOpenaiConversationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (!dbConnected || !db) {
    const conv = createDevConversation(parsed.data.title);
    res.status(201).json(conv);
    return;
  }

  const [conv] = await db
    .insert(conversations)
    .values({ title: parsed.data.title })
    .returning();

  res.status(201).json({
    id: conv.id,
    title: conv.title,
    createdAt: conv.createdAt,
  });
});

router.get("/openai/conversations/:id", async (req, res): Promise<void> => {
  const params = GetOpenaiConversationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  if (!dbConnected || !db) {
    const conv = getDevConversation(params.data.id);
    if (!conv) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    const msgs = getDevMessages(params.data.id);
    res.json({
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt,
      messages: msgs.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
    });
    return;
  }

  const [conv] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, params.data.id));

  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, params.data.id))
    .orderBy(messages.createdAt);

  res.json({
    id: conv.id,
    title: conv.title,
    createdAt: conv.createdAt,
    messages: msgs.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    })),
  });
});

router.delete("/openai/conversations/:id", async (req, res): Promise<void> => {
  const params = DeleteOpenaiConversationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  if (!dbConnected || !db) {
    const index = devConversations.findIndex((conversation) => conversation.id === params.data.id);
    if (index === -1) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    devConversations.splice(index, 1);
    for (let i = devMessages.length - 1; i >= 0; i--) {
      if (devMessages[i].conversationId === params.data.id) {
        devMessages.splice(i, 1);
      }
    }

    res.sendStatus(204);
    return;
  }

  const [conv] = await db
    .delete(conversations)
    .where(eq(conversations.id, params.data.id))
    .returning();

  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/openai/conversations/:id/messages", async (req, res): Promise<void> => {
  const params = ListOpenaiMessagesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  if (!dbConnected || !db) {
    res.json(
      getDevMessages(params.data.id).map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
    );
    return;
  }

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, params.data.id))
    .orderBy(messages.createdAt);

  res.json(
    msgs.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    }))
  );
});

router.post("/openai/conversations/:id/messages", async (req, res): Promise<void> => {
  const params = SendOpenaiMessageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = SendOpenaiMessageBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  if (!integrations.isGrokConfigured && !integrations.isOpenAiConfigured) {
    // Allow a development-only fallback so local dev can continue when no provider is configured.
    if (process.env.NODE_ENV === "development") {
      console.warn("No AI provider configured — falling back to development reply.");
    } else {
      res.status(503).json({
        error:
          "No AI provider is configured. Set GROQ_BASE_URL/GROQ_API_KEY for Grok or AI_INTEGRATIONS_OPENAI_BASE_URL/AI_INTEGRATIONS_OPENAI_API_KEY for OpenAI.",
      });
      return;
    }
  }

  let conv: { id: number; title: string; createdAt: string } | null = null;
  if (!dbConnected || !db) {
    conv = getDevConversation(params.data.id) ?? null;
  } else {
    const [dbConv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, params.data.id));

    if (dbConv) {
      conv = {
        id: dbConv.id,
        title: dbConv.title,
        createdAt: dbConv.createdAt.toISOString(),
      };
    }
  }

  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  // Save user message
  if (!dbConnected || !db) {
    createDevMessage(params.data.id, "user", body.data.content);
  } else {
    await db.insert(messages).values({
      conversationId: params.data.id,
      role: "user",
      content: body.data.content,
    });
  }

  // Get full message history
  const history = !dbConnected || !db
    ? getDevMessages(params.data.id)
    : await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, params.data.id))
        .orderBy(messages.createdAt);

  const chatMessages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullResponse = "";

  let stream: any = null;

  try {
    stream = await integrations.openai.chat.completions.create({
      max_completion_tokens: 8192,
      messages: chatMessages,
      stream: true,
    });
  } catch (err) {
    console.error("AI integration error:", err);
    // If we're in development, stream a small fallback reply so the UI remains usable
    if (process.env.NODE_ENV === "development") {
      const fallback = "Grok is unreachable — this is a development fallback reply. The real AI integration failed to connect.";
      console.warn("Using development fallback reply for AI integration failure.");
      const parts = fallback.match(/.{1,80}/g) || [fallback];
      for (const part of parts) {
        fullResponse += part;
        try {
          res.write(`data: ${JSON.stringify({ content: part })}\n\n`);
        } catch (e) {
          // ignore stream write errors
        }
        // small pause to simulate streaming
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 50));
      }

      // Save assistant message
      if (!dbConnected || !db) {
        createDevMessage(params.data.id, "assistant", fullResponse);
      } else {
        await db.insert(messages).values({
          conversationId: params.data.id,
          role: "assistant",
          content: fullResponse,
        });
      }

      try {
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      } catch (e) {
        // ignore
      }
      res.end();
      return;
    }

    // Return a JSON error so client receives structured information instead of HTML
    res.status(502).json({ error: "AI integration error", details: err instanceof Error ? err.message : String(err) });
    return;
  }

  try {
    for await (const chunk of stream!) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
  } catch (err) {
    console.error("AI stream error:", err);
    // Notify the client the stream failed and end
    try {
      res.write(`data: ${JSON.stringify({ done: true, error: err instanceof Error ? err.message : String(err) })}\n\n`);
    } catch (e) {
      // ignore write errors
    }
    res.end();
    return;
  }

  // Save assistant message
  if (!dbConnected || !db) {
    createDevMessage(params.data.id, "assistant", fullResponse);
  } else {
    await db.insert(messages).values({
      conversationId: params.data.id,
      role: "assistant",
      content: fullResponse,
    });
  }

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

export default router;
