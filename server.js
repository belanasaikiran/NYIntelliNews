import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { fetchFromGoogle } from "./services/fetchNews/fetchfromGoogle.js";
import { fetchFromNYT } from "./services/fetchNews/fetchFromNYT.js";
import { handleNewsPipeline } from "./services/fetchNews/llamarouterAgent.js";
import { fetchRelatedNews } from "./newsFetcher.js";
import { generateSummary } from "./llama.js";
import { pageContentExtractor } from "./services/summarizers/pageContentExtractor.js";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  }),
);

app.use(bodyParser.json());

app.post("/api/google-news", async (req, res) => {
  const { query, numResults } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Missing "query" in request body' });
  }
  try {
    const results = await fetchFromGoogle(query, numResults || 10);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch from Google" });
  }
});

app.post("/api/nyt-news", async (req, res) => {
  const { query, mode } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Missing "query" in request body' });
  }
  try {
    const results = await fetchFromNYT(query, mode);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch from NYT" });
  }
});

app.post("/api/news-pipeline", handleNewsPipeline);

app.post("/summarize_old", async (req, res) => {
  const input = req.body;
  console.log("Received Input:", input);
  try {
    var GetRelatedArticles = await fetchFromGoogle(input.title, 10);
    // const extractedAllArticles = await pageContentExtractor(input.url);
    // for each article, extract content and store in extractedArticles

    console.log("output form get related articles: ", GetRelatedArticles);
    const extractedArticles = [];
    for (const article of GetRelatedArticles) {
      const content = await pageContentExtractor(article.url);
      extractedArticles.push({ ...article, content });
    }
    console.log("Extracted Articles:", extractedArticles);

    const relatedArticles =
      GetRelatedArticles.articles.concat(extractedArticles);
    const summary = await generateSummary(input, relatedArticles);
    console.log("Summary Generated:", summary);

    res.json({ summary });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/summarize", async (req, res) => {
  const input = req.body;
  console.log("Received Input:", input);
  try {
    // Step 1: Fetch articles from Google
    const relatedArticlesRaw = await fetchFromGoogle(input.title, 10);
    console.log("📦 Fetched Articles:", relatedArticlesRaw);

    // Step 2: Extract full content from each article URL
    const extractedArticles = await Promise.all(
      relatedArticlesRaw.map(async (article) => {
        const content = await pageContentExtractor(article.title, article.url);
        console.log("📝 Extracted content for:", article.url);
        return { ...article, content };
      }),
    );

    console.log("Input to Llama:");
    console.log(extractedArticles);

    // Step 3: Generate summary using LLaMA
    const summary = await generateSummary(input, extractedArticles);

    console.log("Summary Generated:", summary);

    res.json({ summary });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
