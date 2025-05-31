import LlamaAPIClient from 'llama-api-client';
import { fetchFromNYT } from './fetchFromNYT.js';
import { fetchFromGoogle } from './fetchfromGoogle.js';

const llama = new LlamaAPIClient({ apiKey: process.env.LLAMA_API_KEY });

const trustedPublishers = new Set([
  "New York Times", "BBC", "CNN", "Reuters", "Forbes",
  "TechCrunch", "Bloomberg", "The Guardian", "Wired", "The Verge"
]);

export const handleNewsPipeline = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing "prompt"' });
  }

  try {
    const routingPrompt = `
You are a smart router. Decide which of the following sources should be called for the user query:
Prompt: "${prompt}"
Available sources: "nyt_top", "nyt_search", "google"
Return JSON: { "sourcesToCall": ["..."] }
    `.trim();

    const routingRes = await llama.chat.completions.create({
      model: 'Llama-4-Maverick-17B-128E-Instruct-FP8',
      messages: [{ role: 'user', content: [{ type: 'text', text: routingPrompt }] }]
    });

    const { sourcesToCall } = JSON.parse(routingRes.choices[0].message.content);

    let allArticles = [];

    if (sourcesToCall.includes('nyt_top')) {
      const nytTop = await fetchFromNYT(prompt, 'today');
      allArticles.push(...nytTop);
    }

    if (sourcesToCall.includes('nyt_search')) {
      const nytSearch = await fetchFromNYT(prompt, null);
      allArticles.push(...nytSearch);
    }

    if (sourcesToCall.includes('google')) {
      const googleResults = await fetchFromGoogle(prompt);
      allArticles.push(...googleResults);
    }

    const enrichedArticles = allArticles.map(article => ({
      ...article,
      isTrusted: trustedPublishers.has(article.publisher)
    }));

    const scoringPrompt = `
You are a news evaluator AI. Evaluate each article based on:
1. Relevance to this user prompt: "${prompt}"
2. Source credibility from "isTrusted": true or false

Return JSON:
[
  {
    "title": "...",
    "url": "...",
    "publisher": "...",
    "confidenceScore": 0.0 - 1.0
  }
]

Only include up to 15 articles.
Articles:
${JSON.stringify(enrichedArticles.slice(0, 15), null, 2)}
    `.trim();

    const scoreRes = await llama.chat.completions.create({
      model: 'Llama-4-Maverick-17B-128E-Instruct-FP8',
      messages: [{ role: 'user', content: [{ type: 'text', text: scoringPrompt }] }]
    });

    const scoredArticles = JSON.parse(scoreRes.choices[0].message.content);
    res.json({ results: scoredArticles });
  } catch (err) {
    console.error("News pipeline error:", err.message);
    res.status(500).json({ error: 'Failed to fetch and score news articles' });
  }
};
