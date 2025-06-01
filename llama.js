import dotenv from "dotenv";
dotenv.config();

import LlamaAPIClient from "llama-api-client";
import { pageContentExtractor } from "./services/summarizers/pageContentExtractor.js";

if (!process.env.LLAMA_API_KEY) {
  throw new Error("LLAMA_API_KEY is not set in environment variables");
}

const client = new LlamaAPIClient({
  apiKey: process.env.LLAMA_API_KEY,
});

export const generateSummary = async (input, relatedArticles, language) => {
  const mainContent = await pageContentExtractor(input.title, input.url);

  const relatedDetails = await Promise.all(
    relatedArticles.map(async (a) => {
      const text = await pageContentExtractor(a.title, a.url);
      return `---\nTitle: ${a.title}\nPublisher: ${a.publisher}\nContent:\n${text}`;
    })
  );

  const prompt = `
You are a professional news summarizer trained in the BBC editorial style.

Summarize the following article and related sources in ${language}. Use a calm, neutral, and fact-based tone, as used by BBC news anchors.

Structure:
Paragraph 1 — Lead and context (who, what, where, when)
Paragraph 2 — Key facts from the main and supporting articles
Paragraph 3 — Broader implications or closing information

Do not include markdown, headings, or explanations — just return the plain ${language} summary.

Main Article Title:
"${input.title}"

Main Article:
${mainContent}

Related Articles:
${relatedDetails.join("\n\n")}
`.trim();

  try {
    const res = await client.chat.completions.create({
      model: "Llama-4-Maverick-17B-128E-Instruct-FP8",
      messages: [{ role: "user", content: prompt }],
      max_completion_tokens: 1024,
      temperature: 0.3,
    });

    console.log("LLaMA Raw Response:", JSON.stringify(res, null, 2));

    return (
      res.completion_message?.content?.text?.trim() || "Summary not found."
    );
  } catch (err) {
    console.error("LLaMA summarization error:", err.message);
    return "Summary generation failed. Please try again.";
  }
};
