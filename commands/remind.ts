import { Message, UserResolvable } from "discord.js";
import { Command, CommandDefinition, Action } from ".";

export const description: CommandDefinition = {
  name: "Reminder Bot",
  description:
    "Reminds a subset of users with a specific message. Only usable by Admins & Mods.",
  usage: ["!remind `<role>` <message>"],
  keys: ["remind"],
};

/**
 * Splits the paramaters provided into an array
 * Will quit early if Regex match is undefiend or if code syntax is missing
 * @param content The message provided by the user.
 * @return An array of two elements: the target role, and the message to send
 */
function parseMessage(content: string): string[] {
  const paramArray = content
    .replace("!remind ", "")
    .match(/^(\S+)\s(.*)/)
    ?.slice(1);
  if (paramArray === undefined) return []; // Quit if invalid format was passed
  if (paramArray[0].match(/`/gi)?.length !== 2) return []; // Quit if missing code syntax
  paramArray[0] = paramArray[0].slice(1, -1); // Slice off the code syntax (no longer needed)
  return paramArray;
}

export const action = (message: Message, key: string) => {
  if (!message.guild) {
    // Cannot be called outside of a server
    message.author.send("Call me in a server!");
    return;
  }

  const highestRole = message.member?.roles.highest.name; // Request must be from Admin or Mod
  if (!(highestRole === "Admin" || highestRole === "Mod")) {
    message.reply("Sorry! I only accept !remind requests from Admins or Mods");
    return;
  }

  const paramArray = parseMessage(message.content); // Parse the target role and message to send
  if (paramArray.length === 0) {
    message.reply(
      "I couldn't understand your request... For example you can do !remind `Mod` Hi all Mods!. Please make sure to wrap the role in `code syntax`!"
    );
    return;
  }

  // Fetch the role ID of the role name provided
  const roleId = message.guild.roles.cache.find((r) => r.name === paramArray[0])
    ?.id;
  if (roleId === undefined) {
    // Quit if role is invalid
    message.reply(
      "I don't recognize that role, perhaps there is a typo in it, or no user is categorized by it."
    );
    return;
  }

  // Fetch all members that are a part of the retrieved roleID
  const memberList = message.guild.members.cache.filter(
    (m) => m.roles.cache.has(roleId) && !m.user.bot
  );
  const membersJSON: any = memberList.toJSON();
  for (const key in membersJSON) {
    // Iterate through each member JSON
    message.guild.members
      .fetch(membersJSON[key].userID) // Fetch the member based on ID
      .then((user: any) => {
        // Send the current member a DM
        user.send(
          `**You've got mail! :mailbox_with_mail:**\n` +
            `You are receiving this message because you are categorized under the following role: ${paramArray[0]}\n\n*` +
            paramArray[1] +
            `*\n\nThis automated message was sent to you on behalf of **${message.author.username}** from the **${message.guild?.name}**`
        );
      });
  }
  message.reply("message has been sent to " + memberList.size + " members");
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
