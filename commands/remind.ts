import { Message, UserResolvable } from "discord.js";
import { Command, CommandDefinition, Action } from ".";

export const description: CommandDefinition = {
  name: "Reminder (Admin)",
  description: "Reminds a subset of users with a specific message.",
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
  const roleSelect = content.match(/(`([^`]*(\ )*[^`]+(\ )*[^`]*)+`)/g)?.[0];
  if (roleSelect == null) return [];

  const messageToSend = content.replace(
    content.match(/(.*?`([^`]+)`)/)![0].toString(),
    ""
  );
  if (messageToSend == null) return [];

  const paramArray = [roleSelect, messageToSend];
  if (paramArray === undefined) return []; // Quit if invalid format was passed
  if (paramArray[0].match(/`/gi)?.length !== 2) return []; // Quit if missing code syntax
  paramArray[0] = paramArray[0].slice(1, -1); // Slice off the code syntax (no longer needed)
  return paramArray;
}

/**
 * Repeats an action a set number of times in an attempt to complete it.
 * @param delay Initial delay. Doubles each retry.
 * @param retries Number of times to retry the command.
 * @param name Name to keep track of requests in the logs.
 * @param action Function to attempt to send.
 */
export const retryAction = (
  delay: number,
  retries: number,
  name: string,
  action: () => Promise<any>
) => {
  // Throw an error if we're out of retries.
  if (retries > 0) {
    console.log("Async-Retry action: " + name);
    // Otherwise, call the action and repeat it if it fails.
    action()
      .then((res) => {
        console.log("Successfully completed Async-Retry action: " + name);
      })
      .catch((err) => {
        setTimeout(() => {
          console.log(
            `Retrying action "${name}", delay:${delay}, retries left: ${retries}, error: [${Object.keys(
              err
            ).join(", ")}] -> ${err.toString()}`
          );
          retryAction(delay * 2, retries - 1, name, action);
        }, delay);
      });
  } else {
    console.error("Exceeded the number of action retries for action: " + name);
  }
};

export const action = (message: Message, key: string) => {
  // Cannot be called outside of a server
  if (!message.guild) {
    console.log(
      "Rejected reminder because the message was not called in a guild."
    );
    message.author.send("Call me in a server!");
    return;
  }

  // Ensure the content length is short enough to send.
  if (message.content.length > 1602) {
    console.log("Rejected reminder because the message was too long.");
    message.reply(
      "I can't send something this long, try to keep your message under 1600 characters."
    );
  }

  // Request must be from Admin or Mod
  const highestRole = message.member?.roles.highest.name;
  if (
    !(
      (
        highestRole === "Admin" ||
        highestRole === "Mod" ||
        message.author.id === "749656589887340607"
      ) // id belongs to @RyanFleck ;)  TODO: Remove hardcoded id after testing.
    )
  ) {
    console.log("Rejected reminder because the user was not a moderator.");
    message.reply("Sorry! I only accept !remind requests from Admins or Mods");
    return;
  }

  const paramArray = parseMessage(message.content); // Parse the target role and message to send
  if (paramArray.length === 0) {
    console.log(
      "Rejected reminder because the message parser failed to recognize a valid command."
    );
    message.reply(
      "I couldn't understand your request... For example you can do !remind `Mod` Hi all Mods!. Please make sure to wrap the role in `code syntax`!"
    );
    return;
  }

  // Fetch the role ID of the role name provided
  const roleName = paramArray[0];
  const cleanedMessage = paramArray[1];
  const roleId = message.guild.roles.cache.find((r) => r.name === roleName)?.id;

  // Quit if role is invalid
  if (roleId === undefined) {
    console.log("Rejected reminder because the given role is invalid.");
    message.reply(
      "I don't recognize that role, perhaps there is a typo in it, or no user is categorized by it."
    );
    return;
  }

  // Fetch all members that are a part of the retrieved roleID
  const memberList = message.guild.members.cache.filter(
    (m) => m.roles.cache.has(roleId) && !m.user.bot
  );

  // Communicate that the message is being sent.
  message.reply(
    `attempting to send message to ${memberList.size} users with the @${roleName} role`
  );

  // Load all the messages to-be-sent into the event queue
  let i = 0;
  memberList.forEach(async (gm, key) => {
    retryAction(
      1000,
      3,
      `Sending message #${++i} to ${gm.user.username}`,
      () => {
        return gm.send(
          `**You've got mail! :mailbox_with_mail:**\n` +
            `*You are receiving this message because you are categorized under the following role: ${roleName}*\n\n` +
            cleanedMessage +
            `\n\n*This automated message was sent to you on behalf of **${message.author.username}** from the **${message.guild?.name}***`
        );
      }
    );
  });
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
