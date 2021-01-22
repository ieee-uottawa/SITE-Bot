import { Message } from "discord.js";
import { Command, CommandDefinition } from ".";

const imageType= ['.jpg','.png','.jpeg'];

export const description: CommandDefinition = {
  name: "Pet",
  description: "React to image of pets in pet chanel",
  usage: [""],
  keys: ["pet"],
};

export const action = (message: Message) => {
  message.attachments.each((pic)=>{
    imageType.forEach(type => {
        if (pic.name?.toLowerCase().endsWith(type)) {
            message.react('😍');
            return true;
        }
    });
  });
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;