import Discord from "discord.js";
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
client.login("Nzk4OTg2MDcwNDcyOTE3MDcy.X_8_ww.eTJ9h6G66fVWGZq3lVBW7oZ_IpE");
