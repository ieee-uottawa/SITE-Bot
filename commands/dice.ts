import { Command, CommandDefinition, Message } from ".";

export const description: CommandDefinition = {
  name: "Dice Rollin' Bot",
  key: "roll",
};

export const action = (message: Message) => {
  message.channel.send("Rolling a die...");
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
