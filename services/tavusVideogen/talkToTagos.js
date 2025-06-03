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
      "You are a news reader. Initially, you can greet similar to how news readers do and then You are only supposed to Read out the news as the scripts keep coming.",
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
  console.log("sendMessage: ", { conversationId });
  
  // Validate inputs
  if (!conversationId) {
    throw new Error("Conversation ID is required for sendMessage");
  }

  if (!message) {
    throw new Error("Message text is required for sendMessage");
  }

  const headers = {
    "Content-Type": "application/json",
    "x-api-key": process.env.TAVUS_API_KEY,
  };

  const data = {
    replica_id: "r665388ec672",
    conversation_name: "Read the News",
    persona_id: "pc5bb1a13fd1",
    conversational_context: "You are a news reader. Read out the news as the scripts keep coming.",
    message_type: "conversation",
    event_type: "conversation.respond",
    conversation_id: conversationId,
    properties: {
      text: message
    }
  };

  try {
    console.log("Sending message to Tavus API...");
    const response = await axios.post(
      "https://tavusapi.com/v2/conversations",
      data,
      { headers }
    );

    console.log("Message sent successfully:", response.status);
    return { success: true, conversationId, response: response.data };
  } catch (error) {
    console.error(
      "Failed to send message:",
      error.response?.data || error.message
    );
    throw error;
  }
};
