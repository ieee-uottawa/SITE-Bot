import { Message } from "discord.js";
import { Command, CommandDefinition } from ".";

export const description: CommandDefinition = {
  name: "Contribute",
  description: "Prints instructions for adding a command to the bot.",
  usage: "!contribute",
  key: "contribute",
};

export const action = (message: Message) => {
  message.channel.send(
    "Contribute to the **IEEE uOttawa SITE-Bot**!" +
      "\n\nLook through the source code at" +
      " https://github.com/ieee-uottawa/SITE-Bot" +
      " and send a pull request."
  );
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
