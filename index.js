const express = require("express");
const fetchNewsByCategory = require("./services/nyt");
const summarizeArticles = require("./services/llama");

const app = express();
const PORT = 3000;

app.get("/summarize", async (req, res) => {
  const category = req.query.category || "technology";

  try {
    const news = await fetchNewsByCategory(category);
    const summary = await summarizeArticles(news, category);
    res.json({ category, summary, links: news.map((n) => n.url) });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
