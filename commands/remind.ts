import { Message, UserResolvable } from "discord.js";
import { Command, CommandDefinition, Action } from ".";

export const description: CommandDefinition = {
  name: "Reminder Bot",
  description: "Reminds a subset of users with a specific message. Only usable by Admins & Mods.",
  usage: ["!remind `<role>` <message>"],
  keys: ["remind"],
};

function parseMessage(content : string) : string[] {
  const paramArray = content.replace("!remind ", "").match(/^(\S+)\s(.*)/)?.slice(1);
  if (paramArray === undefined) return []; // Quit if invalid format was passed 
  paramArray[0] = paramArray[0].slice(1, -1); // Take off the ` ` symbols surround the role
  if (paramArray[0] === "") return []; // Quit if user didn't wrap role with ` `
  return paramArray;
}

export const action = (message: Message, key: string) => {
  if (!message.guild) { // Cannot be called outside of a server
    message.author.send("Call me in a server!");
    return;
  } 
  const highestRole = message.member?.roles.highest.name // Request must be from Admin or Mod
  if (!(highestRole === "Admin" || highestRole === "Mod")) {
    message.reply("Sorry! I only accept !remind requests from Admins or Mods");
    return;
  }

  const paramArray  = parseMessage(message.content); // Parse the target role and message to send
  if (paramArray.length === 0) {
    message.reply("I couldn't understand your request... For example you can do !remind `Mod` Hi all Mods!. Please make sure to wrap the role in `code syntax`!");
    return;
  }

  const targetRole = paramArray[0];
  const messageToSend = paramArray[1];
  
  // Fetch all members whose highest role is equal to the role mentioned in the command
  const memberList = message.guild.members.cache.filter((m) => m.roles.highest.name === targetRole);
  const membersJSON : any = memberList.toJSON(); 
  for (const key in membersJSON) { // Iterate through each member JSON
    message.guild.members.fetch(membersJSON[key].userID) // Fetch the member based on ID
    .then((user : any) => {
      user.send(messageToSend); // Send the current member a DM
    })
  }
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;