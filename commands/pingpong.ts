import { Command, CommandDefinition, Message } from ".";

export const description: CommandDefinition = {
  name: "Ping Pong",
  description: "Replies with 'Pong!'",
  usage: "!ping",
  key: "ping",
};

export const action = (message: Message) => {
  message.channel.send("Pong! Wow, the bot works!");
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
