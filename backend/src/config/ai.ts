import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn("⚠️ ANTHROPIC_API_KEY is not set in environment variables.");
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export default anthropic;
