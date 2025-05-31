const axios = require("axios");
require("dotenv").config();

async function fetchNewsByCategory(category) {
  const url = `https://api.nytimes.com/svc/topstories/v2/${category}.json`;

  const { data } = await axios.get(url, {
    params: { "api-key": process.env.NYT_API_KEY },
  });

  return data.results.slice(0, 5).map((article) => ({
    title: article.title,
    abstract: article.abstract,
    url: article.url,
  }));
}

module.exports = fetchNewsByCategory;
