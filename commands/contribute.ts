import { Message } from "discord.js";
import { Action, Command, CommandDefinition } from ".";

export const description: CommandDefinition = {
  name: "Contribute",
  description: "Prints instructions for adding a command to the bot.",
  usage: ["!contribute", "!contribute public"],
  keys: ["contribute"],
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

export const action: Action = async (message: Message): Promise<void> => {
  const isPublic = isCommandPublic(message.content);
  //const messenger = isPublic ? message.channel : message.author;

  message.channel.send(
    "Contribute to the **IEEE uOttawa SITE-Bot**!" +
      "\n\nLook through the source code at" +
      " https://github.com/ieee-uottawa/SITE-Bot" +
      " and send a pull request."
  );
  // if (!isPublic && message.guild)
  //   message.reply(
  //     "I've sent you the details! Type `!contribute public` to print the info to this channel."
  //   );
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
