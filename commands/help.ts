import { Message } from "discord.js";
import { Action, Command, CommandDefinition, commands } from ".";

export const description: CommandDefinition = {
  name: "Help",
  description: "Prints help text for included commands.",
  usage: ["!help", "!help public"],
  keys: ["help"],
};

/**
 * Renders a list of all possible SITE-Bot commands.
 * @param commands The global list of SITE-Bot commands.
 */
export const help = (commands: Command[]): string => {
  return (
    "**SITE-Bot - Help Menu**\n\n" +
    commands
      .map(
        (c) =>
          `**${c.definition.name}**: ${
            c.definition.description
          }${c.definition.usage.map((u) => `\n\t${u}`)}\n`
      )
      .join("\n")
  );
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

export const action: Action = (message: Message) => {
  const isPublic = isCommandPublic(message.content);
  const messenger = isPublic ? message.channel : message.author;

  messenger.send(help(commands));
  if (!isPublic && message.guild)
    message.reply(
      "I've sent you the user manual! Type `!help public` to print the manual to this channel."
    );
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
