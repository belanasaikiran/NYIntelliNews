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
Given the user query: "${prompt}"
Choose which of these sources to call: "nyt_top", "nyt_search", "google".
Return ONLY a JSON object in this format: { "sourcesToCall": ["..."] }
No explanation, no extra text.
`.trim();


    const routingRes = await llama.chat.completions.create({
      model: 'Llama-4-Maverick-17B-128E-Instruct-FP8',
      messages: [{ role: 'user', content: [{ type: 'text', text: routingPrompt }] }]
    });

   
    let sources=[]
   
    try {
      const parsed = JSON.parse(routingRes.completion_message.content.text);
      sources = parsed.sourcesToCall;
    
      
      
    } catch (e) {
      console.error("LLaMA routing JSON parse error:", e.message);
      return res.status(500).json({ error: "LLaMA routing response malformed" });
    }

    // Step 2: Fetch news
    let allArticles = [];

    if (sources.includes('nyt_top')) {
      const nytTop = await fetchFromNYT(prompt, 'top');
      allArticles.push(...nytTop);
      
    }

    if (sources.includes('nyt_search')) {
      const nytSearch = await fetchFromNYT(prompt, null);
      allArticles.push(...nytSearch);
    }

    if (sources.includes('google')) {
      const googleResults = await fetchFromGoogle(prompt, 10);
      allArticles.push(...googleResults);
    
    }

    // Step 3: Enrich with trust label
    const enrichedArticles = allArticles.map(article => ({
      ...article,
      isTrusted: trustedPublishers.has(article.publisher)
    }));

    // Step 4: Score relevance and trust

    const scoringPrompt = `
Given the following news articles (as JSON) and the user prompt: "${prompt}", evaluate each article for:
1. Relevance to the user prompt.
2. Source credibility (isTrusted: true or false).

For each article, assign a confidenceScore between 0.0 and 1.0.

Return ONLY a JSON array in this format (no explanation, no markdown, no extra text):

[
  {
    "title": "...",
    "url": "...",
    "publisher": "...",
    "confidenceScore": 0.0
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
    

    let scoredArticles = [];
    try {
      scoredArticles = JSON.parse(scoreRes.completion_message.content.text);
      

    } catch (e) {
      console.error("LLaMA scoring JSON parse error:", e.message);
      return res.status(500).json({ error: "LLaMA scoring response malformed" });
    }

    res.json({ results: scoredArticles });
  } catch (err) {
    console.error("News pipeline error:", err.message);
    res.status(500).json({ error: 'Failed to fetch and score news articles' });
  }
};
