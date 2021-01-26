import { Message } from "discord.js";
import { Action, Command, CommandDefinition, random } from ".";
import words from "../data/words.json";

export const description: CommandDefinition = {
  name: "Mad Libs",
  description:
    "Replaces the keywords (prepended with '`\\`', like '\\adjective') in your sentence with the appropriate replacement. Will replace: \\noun, \\name (Rami), \\thing (iPhone), \\person (Rick Sanchez), \\animal (duck), \\place (Ottawa), \\quality (hardness), \\idea (loyalty), \\action (kicked), \\verb (attack), \\adverb (abruptly), and \\adjective (awesome). You can type words after the keyword, like '\\verbed'.",
  usage: ["!madlibs <sentence> (like 'Hello \\noun')"],
  keys: ["madlibs", "libs", "ml"],
};

const wordValues = Object.values(words);
const wordKeys = Object.keys(words).map((x) => x.toLowerCase().toString());
// Manufacture special cases.

// Add all nouns to a 'noun' key.
wordKeys.push("noun");
wordValues.push([
  ...words.person,
  ...words.place,
  ...words.thing,
  ...words.animal,
  ...words.quality,
  ...words.idea,
  ...words.action,
]);

// Add duplicate "person" as "name"
wordKeys.push("name");
wordValues.push([
  ...words.person,
]);

function replaceInsertions(word: string): string {
  // If the word doesn't start with an insertion operator, throw it to the wolves.
  if (!word.startsWith("\\")) return word;
  // Remove the insertion operator.
  word = word.substr(1);
  // Check if
  for (let i = 0; i < wordKeys.length; i++) {
    const key: string = wordKeys[i];
    if (word.length >= key.length && word.startsWith(key)) {
      const replacement = random.pick(wordValues[i]);
      // If the key is the same length as the word, return a replacement.
      if (key.length === word.length) {
        return replacement;
      }
      // If additional characters have been included, append them
      return `${replacement}${word.slice(key.length)}`;
    }
  }

  // Maybe throw an error instead of this.
  return `(${word}?)`;
}

export const action: Action = async (message: Message): Promise<void> => {
  // Split the message into an array.
  const splitMessage = message.content.split(" ").slice(1);
  message.channel.send(splitMessage.map((w) => replaceInsertions(w)).join(" "));
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
