import { Message } from "discord.js";
import { Command, CommandDefinition } from ".";

export const description: CommandDefinition = {
  name: "Formula Sheets",
  description: "Prints common formulae for courses.",
  usage: "!sheet <course code>, or leave empty for list of courses.",
  key: "sheet",
};

export const action = (message: Message) => {
  console.log("Getting formula sheet...");
  const messageSplit = message.content.split(" ");

  if (messageSplit.length >= 2) {
    // If the course code is provided, return the cheat sheet.
    message.channel.send("List of course codes.");
  } else {
    // Return list of course codes if message does not have course code.
    message.channel.send("List of course codes.");
  }
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
