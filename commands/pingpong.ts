import { Command, CommandDefinition, Message } from ".";

export const description: CommandDefinition = {
  name: "Ping Pong",
  key: "ping",
};

export const action = (message: Message) => {
    console.log("Pong!");
    message.channel.send('Pong.');
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
