import { Message } from "discord.js";
import { Action, Command, CommandDefinition, commands } from ".";

export const description: CommandDefinition = {
  name: "Help",
  description: "Prints help text for included commands.",
  usage: ["!help", "!help <command>", "!help public"],
  keys: ["help", "man"],
};

// Cache the help menu text.
let helpText: string = "";

/**
 * Renders a list of all possible SITE-Bot commands.
 * @param commands The global list of SITE-Bot commands.
 */
export const help = (): string => {
  // Populate the HelpText if it has not already been filled.
  if (helpText === "")
    helpText =
      "**__SITE-Bot - Help Menu__**\n\n" +
      commands
        .map(
          (c) =>
            `**${c.definition.name}**: ${c.definition.keys
              .map((x) => "`!" + x + "`")
              .join(", ")} - ${
              c.definition.description
            }${c.definition.usage.map((u) => `\n\t${u}`)}\n`
        )
        .join("\n");

  return helpText;
};

export const commandHelp = (command: Command): string => {
  return `**__${command.definition.name}__** - ${command.definition.keys
    .map((x) => "`!" + x + "`")
    .join(", ")}\n\t${
    command.definition.description
  }\n\n**Usage**\n\t${command.definition.usage.join("\n\t")}`;
};

export const action: Action = (message: Message) => {
  const splitContent = message.content.split(" ");

  if (splitContent.length == 1) {
    // If just !public is called, send the manual to the user.
    message.author.send(help());
    message.reply(
      "I've sent you the full user manual! Type `!help public` to print the full manual to this channel."
    );
    return;
  } else if (splitContent.length == 2) {
    // If the keyword is public, send the manual and return.
    if (splitContent[1].toLowerCase() === "public") {
      message.channel.send(help());
      return;
    }
    // Otherwise, search the list of commands for a matching command.
    const key = splitContent[1].toLowerCase().replace("!", "").trim();
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      // Look through each key and if matching, return the help for that command.
      for (let j = 0; j < command.definition.keys.length; j++) {
        const cmdKey = command.definition.keys[j];
        if (cmdKey === key) {
          message.channel.send(commandHelp(command));
          return;
        }
      }
    }
  }
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
