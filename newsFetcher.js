const axios = require("axios");
require("dotenv").config();

async function fetchRelatedNews(title) {
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(title)}&language=en`;

  console.log("Fetching related news for:", title);

  const response = await axios.get(url, {
    headers: { "X-Api-Key": process.env.NEWS_API_KEY },
  });

  console.log("Fetched related news:", response.data.articles.length);
  console.log("response:", response.data);

  return response.data; // Return top 3 related articles
}

module.exports = { fetchRelatedNews };
