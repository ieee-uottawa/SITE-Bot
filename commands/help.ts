import { Message } from "discord.js";
import { Command, CommandDefinition, commands } from ".";
import { help } from "../utils";

export const description: CommandDefinition = {
  name: "Help",
  description: "Prints help text for included commands.",
  usage: ["!help", "!help public"],
  key: "help",
};

/**
 * Uses regex to check if an optional parameter was provided
 * @param content The message provided by the user.
 */
function isCommandPublic(content: string): boolean {
  const match = content.toLowerCase().match(/\b(\w*public\w*)\b/g);
  if (match === null) return false; // Quit early if no matches found.
  return true;
}

export const action = (message: Message) => {
  const isPublic = isCommandPublic(message.content);
  const messenger = isPublic ? message.channel : message.author;

  messenger.send(help(commands));
  if (!isPublic)
    message.channel.send(
      "I've sent you the user manual! Type `!help public` to print the manual to this channel."
    );
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
