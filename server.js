import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { fetchFromGoogle } from './services/fetchNews/fetchfromGoogle.js';
import { fetchFromNYT } from './services/fetchNews/fetchFromNYT.js';
import { handleNewsPipeline } from './services/fetchNews/llamarouterAgent.js';




dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/api/google-news', async (req, res) => {
  const { query, numResults } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Missing "query" in request body' });
  }
  try {
    const results = await fetchFromGoogle(query, numResults || 10);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from Google' });
  }
});

app.post('/api/nyt-news', async (req, res) => {
  const { query, mode } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Missing "query" in request body' });
  }
  try {
    const results = await fetchFromNYT(query, mode);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from NYT' });
  }
});

app.post('/api/news-pipeline', handleNewsPipeline);



app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
