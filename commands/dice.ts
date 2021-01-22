import { Message } from "discord.js";
import { Command, CommandDefinition, Action, random } from ".";

export const description: CommandDefinition = {
  name: "Dice Rollin' Command",
  description: "Roll a die with any sides, default is 6.",
  usage: [
    "!roll <number of sides>",
    "!roll <number of dice> <number of sides>",
    "!flip (flips a coin instead)",
  ],
  keys: ["roll", "flip"],
};

// Functions used by this command
// ==============================

/**
 * Uses a regex to extract the first number given by the user.
 * @param content The message provided by the user.
 */
function parseDieSize(content: string): { num: number; volume: number } {
  const match = content.match(/\d+/g);
  if (match === null) return { num: 6, volume: 1 }; // Quit early if no matches found.
  const len = match.length;
  if (len === 1) {
    // Roll a single die with the given number.
    const num = parseInt(match[0]);
    return { num: num, volume: 1 };
  } else if (len > 1) {
    // Roll multiple dice if multiple numbers are given.
    const num = parseInt(match[1]);
    const volume = parseInt(match[0]);
    return { num: num, volume: volume };
  } else return { num: 6, volume: 1 };
}

// Required Command Exports
// ========================

export const action: Action = (message, key) => {
  if (key === "roll") {
    // Extract die size from message.
    const dieData = parseDieSize(message.content);

    // Witty answers
    if (dieData.num < 2) {
      message.channel.send(
        `:game_die: Er, ask the physics prof to show the devs a ${dieData.num}-sided die  :wink:`
      );
      return;
    }

    // Don't roll more than a D10,000
    if (dieData.num > 10_000) {
      message.channel.send(
        ":game_die: Ugh, I can't roll a die that size! :skull:"
      );
      return;
    }

    // Don't roll more than 500 dice.
    if (dieData.volume > 200) {
      message.channel.send(
        ":game_die: I can't roll that volume of dice! :skull:"
      );
      return;
    }

    // Roll the dice.
    const results: number[] = [];
    for (let i = 0; i < dieData.volume; i++) {
      results.push(random.integer(1, dieData.num));
    }

    // Respond based on die size.
    const result = results.join(", ");
    const username = message.author.tag.split("#")[0];
    message.channel.send(
      `:game_die:  ${username} rolled ${
        dieData.volume === 1 ? "a" : dieData.volume
      } **D${dieData.num}** -> ${result}`
    );
  } else {
    // Key is flip
    const res = random.bool();
    const username = message.author.tag.split("#")[0];
    message.channel.send(
      `:coin:  ${username} tossed a coin and... _it's ${
        res ? "HEADS" : "TAILS"
      }!_`
    );
  }
};

// Exports
// =======

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
