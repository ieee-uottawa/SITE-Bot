import { Message } from "discord.js";
import { Action, Command, CommandDefinition, random } from ".";

export const description: CommandDefinition = {
  name: "Spongebobify",
  description: "Parrots the previously posted message in slow spongebob.",
  usage: ["!spongebobify or !spongebob or !sb"],
  keys: ["spongebobify", "spongebob", "sb"],
};

/**
 * Alright, let's see how long this function can last before the mods
 * demand the feature is removed or ban the bot. Should be fun.
 */

// Functions for Errors and Error Handling
// =======================================

function sendApology(message: Message, err: any) {
  message.channel.send(
    `:skull_crossbones:  An error occured during spongebobification. :fire:\n ` +
      `Call 1-800-DEVELOPER if the message below looks bad enough.\n` +
      "```Error: " +
      err.toString() +
      "```"
  );
  console.error(err);
}

function spongebobify(text: string): string {
  const split = text.toLowerCase().split("");
  const noSpecials = split.filter((char) => {
    // Don't return discord styling tokens.
    if (char === "*" || char === "_" || char === "^") return false;
    return true;
  });
  const uPpEr = noSpecials.map((char) => {
    if (random.bool()) return char.toUpperCase(); // Half are upper.
    if (char === " ") return "  "; // Spaces to double spaces
    if (random.bool()) return char + " "; // Extra spaces sometimes
    return char;
  });
  return uPpEr.join(" ");
}

// Command Action Function
// =======================

export const action: Action = (message: Message) => {
  message.channel.messages
    .fetch()
    .then((messageList) => {
      // messageList now contains the last few messages.
      if (messageList) {
        const res = messageList.every((target) => {
          // Continue the loop if the message was from a bot or a bot command.
          if (target.author.bot) return true;
          if (target.content.startsWith("!")) return true;
          if (!target.content || target.content.trim() === "") return true;
          // Spongebobify the message and return.
          target.channel.send(spongebobify(target.content));
          return false;
        });
        if (res === true) {
          message.channel.send(
            ":confounded:  The last few messages are bot commands, media, and invocations..."
          );
        }
      } else {
        throw new Error("Hm, I couldn't grab the last few messages.");
      }
    })
    .catch((err) => {
      sendApology(message, err);
    });
};

// Command Exports
// ===============

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
