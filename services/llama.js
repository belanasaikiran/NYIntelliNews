const axios = require("axios");
require("dotenv").config();

async function summarizeArticles(articles, category) {
  const articleText = articles
    .map((a) => `Title: ${a.title}\nAbstract: ${a.abstract}`)
    .join("\n\n");

  const prompt = `
You're an AI summarizer. Summarize the following top ${category} news stories into a concise, human-friendly script suitable for video narration:\n\n${articleText}\n\n
Return in under 200 words.
`;

  const response = await axios.post(
    "https://api.together.xyz/v1/chat/completions", // Replace with your LLaMA endpoint
    {
      model: "meta-llama/Llama-4-8b-chat",
      messages: [{ role: "user", content: prompt }],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.LLAMA_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  return response.data.choices[0].message.content;
}

module.exports = summarizeArticles;
