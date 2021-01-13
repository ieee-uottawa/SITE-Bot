import Discord from "discord.js";
import dotenv from "dotenv";
import { handleMessage, Message } from "./commands";

// Leave this call for the logs.
console.log("Starting Discord Bot");

const client = new Discord.Client();

const world = "world";

export function hello(word: string = world): string {
  return `Hello ${world}! `;
}

client.once("ready", () => {
  console.log("Logged in to Discord! The bot should be available now.");
});

client.on("message", (message: Message) => {
  // Error handling should occur here.
  handleMessage(message);
});

// This call should come last.
dotenv.config();
client.login(process.env.DISCORD_API_KEY);
