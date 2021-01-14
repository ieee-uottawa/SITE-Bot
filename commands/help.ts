import { Message } from "discord.js";
import { Command, CommandDefinition, commands } from ".";
import { help } from "../utils";

export const description: CommandDefinition = {
  name: "Help",
  description: "Prints help text for included commands.",
  usage: "!help",
  key: "help",
};

export const action = (message: Message) => {
  message.author.send(help(commands));
  message.channel.send("Check your inbox!");
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
