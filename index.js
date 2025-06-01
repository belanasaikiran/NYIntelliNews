const express = require("express");
const { fetchRelatedNews } = require("./newsFetcher");
const { generateSummary } = require("./llama");

const app = express();
app.use(express.json());

app.post("/summarize", async (req, res) => {
  const input = req.body;
  console.log("Received Input:", input);
  try {
    const GetrelatedArticles = await fetchRelatedNews(input.title);
    const relatedArticles = GetrelatedArticles.articles;
    const summary = await generateSummary(input, relatedArticles);
    console.log("Summary Generated:", summary);

    res.json({ summary });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
