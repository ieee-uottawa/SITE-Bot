import { Message } from "discord.js";
import { Command, CommandDefinition } from ".";

export const description: CommandDefinition = {
  name: "Russian Roulette",
  description:
    "Has a 1/5 chance of kicking you from the server. Don't play alone.",
  usage: ["!roulette", "!roulette extreme (will one-day ban instead of kick)"],
  key: "roulette",
};

/**
 * Uses regex to check if an optional parameter was provided
 * @param content The message provided by the user.
 */
function isExtreme(content: string): boolean {
  const match = content.toLowerCase().match(/\b(\w*extreme\w*)\b/g);
  if (match === null) return false; // Quit early if no matches found.
  return true;
}

/**
 * Returns a 1/6 chance of killing the user.
 */
function areYouKill(): boolean {
  const random = Math.random();
  console.log(`Res: ${random}`);
  // Random number seem to concentrate about 5, so let's use this to our advantage.
  return random >= 2 / 5 && random <= 3 / 5;
}

/**
 * Handles the case where the bot does not have admin permissions.
 * @param exception returned by the Discord API.
 * @param message The message sent by the user.
 */
function unbannable(exception: any, message: Message) {
  const username = message.author.tag.split("#")[0];
  message.channel.send(
    `I don't have the power to handle ${username}... _yet!_  :smiling_imp:`
  );
}

export const action = (message: Message) => {
  // If not in a guild, tell 'em to play with friends.
  if (!message.guild) {
    message.reply(":gun: This game is better with friends.  :wink:");
    return;
  }

  // Otherwise, pull the trigger.
  const extreme = isExtreme(message.content);
  const result = areYouKill();
  message.reply(
    `you spin the barrel, pull the trigger and... ${
      result
        ? "**BANG!** _you're dead!_  :skull_and_crossbones:"
        : "nothing happens.  :sweat_smile:"
    }`
  );

  // If the result was true, take action.
  if (result) {
    if (!message.member) return; // Not sure why this would be the case.
    const username = message.author.tag.split("#")[0];
    message.channel.send(
      `_The late ${username}'s body was ${
        extreme ? "banned" : "kicked"
      } from the server._`
    );

    // Handle the death based on game severity.
    const reason = "Lost a game of Russian Roulette.";
    if (extreme) {
      message.member
        .ban({
          days: 1,
          reason: reason,
        })
        .catch((exception) => unbannable(exception, message));
    } else {
      message.member
        .kick(reason)
        .catch((exception) => unbannable(exception, message));
    }
  }
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
