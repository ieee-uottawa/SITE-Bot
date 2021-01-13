import Discord from "discord.js";
import dotenv from "dotenv";
import express from "express";
import { handleMessage, Message } from "./commands";

/**
 * ATTENTION, CONTRIBUTORS!
 * ========================
 * To add functionality to this bot, please create a file in /commands
 * that exports an object with type "Command". See the tutorial for more
 * details. Please do not modify this file.
 */

const client = new Discord.Client();

client.once("ready", () => {
  console.log("Logged in to Discord! The bot should be available now.");
});

client.on("message", (message: Message) => {
  // Return an empty string (no key) if message does not start with a bang.
  if (!message.content.startsWith("!")) return;
  handleMessage(message);
});

dotenv.config();
// This Discord client call should come last.
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
