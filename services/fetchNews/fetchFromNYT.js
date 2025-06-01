import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export const fetchFromNYT = async (query, mode) => {
  const key = process.env.NYT_API_KEY;

  const validSections = [
    "arts", "automobiles", "books", "business", "fashion", "food", "health",
    "home", "insider", "magazine", "movies", "nyregion", "obituaries",
    "opinion", "politics", "realestate", "science", "sports", "sundayreview",
    "technology", "theater", "t-magazine", "travel", "upshot", "us", "world"
  ];

  try {
    if (mode === "top") {
      // Use Top Stories API for predefined sections
      const section = validSections.includes(query.toLowerCase()) ? query.toLowerCase() : "home";
      const url = `https://api.nytimes.com/svc/topstories/v2/${section}.json?api-key=${key}`;
      const res = await axios.get(url);

      return res.data.results.map(article => ({
        title: article.title,
        url: article.url,
        publisher: "New York Times",
        category: section
      }));
    } else {
      // Use Article Search API with filter and search query
      const url = `https://api.nytimes.com/svc/search/v2/articlesearch.json`;

      const res = await axios.get(url, {
        params: {
          q: query,
          fq: 'timesTag.location:"New York City"',
          sort: 'newest',
          'api-key': key
        }
      });

      return res.data.response.docs.map(article => ({
        title: article.headline?.main || "Untitled",
        url: article.web_url,
        publisher: "New York Times",
        category: article.section_name || "custom"
      }));
    }
  } catch (err) {
    console.error("NYT fetch error:", err.message);
    return [];
  }
};
