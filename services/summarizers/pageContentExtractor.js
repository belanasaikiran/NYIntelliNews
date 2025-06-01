import axios from "axios";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import * as cheerio from "cheerio";

/**
 * Extracts full readable article content using Readability
 * @param {string} title - Title of the article (optional, for context/logging)
 * @param {string} url - URL of the article
 * @returns {Promise<string>} - Full readable article content
 */

export const pageContentExtractor = async function (title, url) {
  console.log(`📄 Extracting content for: "${title}"\n🔗 ${url}`);

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0", // Avoid bot blocking
      },
      timeout: 10000,
    });

    // 🧼 Load with cheerio for cleanup
    const $ = cheerio.load(response.data);
    // Remove scripts, styles, and other junk
    $("script, style, noscript, link, iframe").remove();

    // Get cleaned HTML
    const cleanedHTML = $.html();

    const dom = new JSDOM(cleanedHTML, {
      url,
      resources: "usable", // don't fetch resources
      runScripts: "outside-only", // disable JS execution
    });

    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article || !article.textContent) {
      console.warn("⚠️ Article content could not be extracted.");
      return "";
    }

    // Basic junk cleanup: remove excessive whitespace
    const cleaned = article.textContent
      .replace(/\s{3,}/g, " ")
      .replace(/\\n/g, "\n");
    return cleaned;
  } catch (error) {
    console.error(`❌ Failed to extract content from ${url}:`, error.message);
    return "";
  }
};
