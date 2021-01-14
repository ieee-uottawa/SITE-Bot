import { Command, CommandDefinition, Message } from ".";

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

/**
 * Returns a random number below the maximum.
 * @param max The highest possible roll.
 */
function getRandomInt(max: number): number {
  return 1 + Math.floor(Math.random() * Math.floor(max));
}

// Required Command Exports
// ========================

export const description: CommandDefinition = {
  name: "Dice Rollin' Bot",
  description: "Roll a die with any sides, default is 6.",
  usage: "!roll <number of sides>\n\t!roll <number of dice> <number of sides>",
  key: "roll",
};

export const action = (message: Message) => {
  // Extract die size from message.
  const dieData = parseDieSize(message.content);

  // Don't roll more than a D10,000
  if (dieData.num > 10_000) {
    message.channel.send("Ugh, I can't roll a die that size!");
    return;
  }

  // Don't roll more than 200 dice.
  if (dieData.volume > 200) {
    message.channel.send("I can't roll that volume of dice!");
    return;
  }

  const results: number[] = [];
  for (let i = 0; i < dieData.volume; i++) {
    results.push(getRandomInt(dieData.num));
  }
  // Respond based on die size.
  const result = results.join(", ");
  message.channel.send(
    `:game_die: Rolling ${dieData.volume} **D${dieData.num}** -> ${result}`
  );
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
