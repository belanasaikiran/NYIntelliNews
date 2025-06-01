// sendDailyMessage.js
import puppeteer from "puppeteer";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const createTavusConversation = async function () {
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": process.env.TAVUS_API_KEY,
  };

  const data = {
    replica_id: "r665388ec672",
    conversation_name: "Read the News",
    persona_id: "pc5bb1a13fd1",
    conversational_context:
      "You are a news reader. Read out the news as the scripts keep coming.",
  };

  try {
    const response = await axios.post(
      "https://tavusapi.com/v2/conversations",
      data,
      { headers },
    );

    const conversation = response.data;
    // console.log("cnv", conversation);
    var conversationId = conversation.conversation_id;
    var conversationUrl = conversation.conversation_url;
    console.log("Conversation URL:", conversationUrl);
    console.log("Conversation ID:", conversationId);

    return { conversationId, conversationUrl };
  } catch (error) {
    console.error(
      "Failed to create conversation:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
export const sendMessage = async function (conversationId, url, message) {
  console.log("sendMessage: ");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--use-fake-ui-for-media-stream", "--no-sandbox"],
  });

  const page = await browser.newPage();

  await page.goto("about:blank");

  // Inject Daily SDK
  await page.addScriptTag({
    url: "https://unpkg.com/@daily-co/daily-js",
  });

  // Wait until Daily is available
  await page.waitForFunction(() => typeof window.Daily !== "undefined");

  console.log("Daily.js loaded");

  await page.evaluate(
    async ({ conversationId, url, message }) => {
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));

      const call = window.Daily.createFrame({
        iframeStyle: {
          position: "fixed",
          width: "1px",
          height: "1px",
          left: "-100px",
          top: "-100px",
        },
      });

      await call.join({ url });

      // Wait for join confirmation
      await wait(3000);

      const interaction = {
        message_type: "conversation",
        event_type: "conversation.echo",
        conversation_id: conversationId,
        properties: {
          text: message,
        },
      };

      call.sendAppMessage(interaction, "*");

      await wait(2000); // Let message send
    },
    { conversationId, url, message },
  );

  await browser.close();
  console.log("Message sent successfully.");
};
