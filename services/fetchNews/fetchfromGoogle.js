import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

export const fetchFromGoogle = async (query, numResults = 30) => {
  const url = "https://www.googleapis.com/customsearch/v1";
  try {
    const res = await axios.get(url, {
      params: {
        key: GOOGLE_API_KEY,
        cx: GOOGLE_CSE_ID,
        q: query,
        num: Math.min(numResults, 15),
      },
    });

    const items = res.data.items || [];

    console.log("All items:", items);
    return items.map((item) => ({
      title: item.title,
      url: item.link,
      publisher: item.displayLink || new URL(item.link).hostname,
    }));
  } catch (err) {
    console.error("Google fetch error:", err.message);
    return [];
  }
};
