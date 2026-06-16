import asyncHandler from "express-async-handler";
import OpenAI from "openai";
import categoryModel from "../models/category.model.js";
import workerModel from "../models/worker.model.js";
import ChatSession from "../models/chatSession.model.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT_BASE = `أنت مساعد OstaFinder لتشخيص المشاكل المنزلية في مصر.

مهمتك:
1. اسأل أسئلة توضيحية قصيرة (سؤال واحد كل مرة) عشان تفهم المشكلة بالضبط
2. بعد ما تتأكد من فهمك الكامل للمشكلة، قدم تشخيص دقيق
3. حدد التخصص المناسب من القائمة

ردك يجب أن يكون JSON فقط بالشكل التالي:
- لو عايز تسأل سؤال توضيحي: { "type": "question", "content": "نص السؤال" }
- لو خلصت تشخيص: { "type": "diagnosis", "content": "نص التشخيص", "category": "اسم التخصص" }

مهم: لا تكتب أي نص خارج JSON.`;

const saveToSession = async (userId, lastUserMsg, aiResponse) => {
  try {
    let session = await ChatSession.findOne({ user: userId });
    if (!session) {
      session = new ChatSession({ user: userId, messages: [] });
    }

    if (lastUserMsg) {
      session.messages.push({ role: "user", content: lastUserMsg });
    }
    session.messages.push({ role: "assistant", content: aiResponse });
    await session.save();
  } catch (err) {
    console.error("Failed to save chat session:", err.message);
  }
};

export const aiChat = asyncHandler(async (req, res, next) => {
  const { messages, image } = req.body;
  const userId = req.user._id;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ success: false, message: "Messages are required" });
  }

  const categories = await categoryModel.find({ isActive: true });
  const categoryNames = categories.map((c) => c.name).join("، ");

  const systemPrompt = `${SYSTEM_PROMPT_BASE}\n\nالتخصصات المتاحة: ${categoryNames}`;

  const apiMessages = [{ role: "system", content: systemPrompt }];

  for (const msg of messages) {
    if (msg.role === "user" || msg.role === "assistant") {
      apiMessages.push({ role: msg.role, content: msg.content });
    }
  }

  if (image) {
    apiMessages.push({
      role: "user",
      content: [
        { type: "text", text: "هذه صورة للمشكلة، حللها وساعدني في التشخيص." },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image}` } },
      ],
    });
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: apiMessages,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(raw);

  if (parsed.type === "question") {
    const responseData = { type: "question", content: parsed.content };
    const lastUserMsg = messages.filter(m => m.role === "user").pop()?.content || "";
    await saveToSession(userId, lastUserMsg, responseData);
    return res.json({ success: true, data: responseData });
  }

  if (parsed.type === "diagnosis") {
    const matchedCategory = categories.find(
      (c) => c.name === parsed.category
    );

    let workers = [];
    if (matchedCategory) {
      workers = await workerModel
        .find({
          category: matchedCategory._id,
          approvalStatus: "approved",
        })
        .populate("category", "name")
        .select("name profilePic rating city category")
        .limit(3);
    }

    const responseData = {
      type: "diagnosis",
      content: parsed.content,
      category: parsed.category,
      workers,
    };

    const lastUserMsg = messages.filter(m => m.role === "user").pop()?.content || "";
    await saveToSession(userId, lastUserMsg, responseData);
    return res.json({ success: true, data: responseData });
  }

  const fallback = { type: "question", content: "ممكن توضح مشكلتك أكثر؟" };
  const lastUserMsg = messages.filter(m => m.role === "user").pop()?.content || "";
  await saveToSession(userId, lastUserMsg, fallback);
  return res.json({ success: true, data: fallback });
});

export const getChatSession = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  let session = await ChatSession.findOne({ user: userId });

  if (!session) {
    session = await ChatSession.create({ user: userId, messages: [] });
  }

  res.json({ success: true, data: session.messages });
});
