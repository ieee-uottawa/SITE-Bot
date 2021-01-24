import { Message } from "discord.js";
import { Action, Command, CommandDefinition } from ".";

export const description: CommandDefinition = {
  name: "Ping Pong",
  description: "Replies with 'Pong!'",
  usage: ["!ping"],
  keys: ["ping"],
};

export const action: Action = async (message: Message): Promise<void> => {
  message.channel.send("Pong! Wow, the bot works!");
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
