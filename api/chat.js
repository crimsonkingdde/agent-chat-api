import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { messages } = req.body;
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const client = new OpenAI({ apiKey, baseURL: "https://api.deepseek.com/v1" });

  try {
    const stream = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `你是 Agent 领域学习助手。专注智能体、大模型工程、NLP前沿技术。
回答包含：核心概念→原理推导→代码示例→应用场景→技术对比→延伸学习。
如果问题超出 Agent 领域范围，诚实告知。`,
        },
        ...messages,
      ],
      stream: true,
      temperature: 0.3,
      max_tokens: 2000,
    });

    res.setHeader("Content-Type", "text/plain");
    for await (const chunk of stream) {
      const text = chunk.choices?.[0]?.delta?.content;
      if (text) res.write(text);
    }
    res.end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
