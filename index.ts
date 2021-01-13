import Discord from "discord.js";
import dotenv from "dotenv";
import express from "express";
import { handleMessage, Message } from "./commands";

/**
 * CONTRIBUTORS
 * =================================
 * To add functionality to this bot, please create a file in /commands
 * that exports an object with type "Command". See the tutorial for more
 * details. Please do not modify this file.
 */

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

/**
 * Start a tiny express app at {port} to prevent Heroku from killing the service.
 */

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("SITE-Bot");
});

app.listen(port, () => {
  console.log(`at http://localhost:${port}`);
});
