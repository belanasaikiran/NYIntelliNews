const dotenv = require("dotenv");
dotenv.config();

const LlamaAPIClient = require("llama-api-client");

if (!process.env.LLAMA_API_KEY) {
  throw new Error("LLAMA_API_KEY is not set in environment variables");
}

// Initialize client
const client = new LlamaAPIClient({
  apiKey: process.env.LLAMA_API_KEY,
});

const generateSummary = async (input, relatedArticles) => {
  const relatedTitles = relatedArticles
    .map((a) => `- ${a.title} (${a.source?.name || "Unknown"})`)
    .join("\n");

  const prompt = `
You are a professional news anchor AI.

You will be given a news headline and a few related articles from trusted sources. Your task is to write a 3-paragraph newsreader-style summary in a calm and articulate tone suitable for video narration.

Main Title:
"${input.title}"

Cross-verified Sources:
${relatedTitles}

Format:
- Introduction (context and background)
- Details and key facts
- Closing remarks or implications

Keep it concise, clear, and fact-based.
`;

  console.log("Prompt:", prompt);

  try {
    const res = await client.chat.completions.create({
      model: "Llama-4-Maverick-17B-128E-Instruct-FP8",
      messages: [{ role: "user", content: prompt }],
      max_completion_tokens: 512,
      temperature: 0.5,
    });

    console.log("LLaMA Raw Response:", JSON.stringify(res, null, 2));

    // if (!res.choices || !res.choices[0] || !res.choices[0].message) {
    //   console.error("Unexpected response format:", res);
    //   return "Summary generation failed due to invalid response format.";
    // }
    return (
      res.completion_message?.content?.text?.trim() || "Summary not found."
    );
  } catch (err) {
    console.error("LLaMA summarization error:", err.message);
    return "Summary generation failed. Please try again.";
  }
};

module.exports = { generateSummary };
