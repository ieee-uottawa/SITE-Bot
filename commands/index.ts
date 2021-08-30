import { MersenneTwister19937, Random } from "random-js";
import { Message } from "discord.js";
import Help from "./help";
import PingPong from "./pingpong";
import Dice from "./dice";
import Knowledge from "./knowledge";
import Contribute from "./contribute";
import Roulette from "./russian-roulette";
import Translate from "./translate";
import Stats from "./stats";
import Stonk from "./stonk";
import Tone from "./tone";
import Remind from "./remind";
import MadLibs from "./madlibs";
import FSM from "./state-machine";
// import Music from "./music";
import NewMember from "./newmember";
import Crypto from "./crypto";

// To register a command, import it above and add it to this array.
export const commands: Command[] = [
  Help,
  // Music,
  Translate,
  MadLibs,
  Tone,
  FSM,
  Stonk,
  Dice,
  Stats,
  Knowledge,
  Roulette,
  Remind,
  NewMember,
  Crypto,
  PingPong,
  Contribute,
];

export type CommandDefinition = {
  name: string; // Ex: "Dice Rollin' Bot"
  description: string; // Ex: "Roll a die with any sides, default is 6."
  usage: string[]; // Ex: ["!roll <number of sides>"]
  keys: string[]; // Ex: ["roll", "coinflip"]
};

export type Command = {
  definition: CommandDefinition;
  action: Action;
};

export type Action = (message: Message, key: string) => Promise<any>;

/**
 * The NodeJS Random engine is terrible, so import and use this instead
 */
export const random = new Random(MersenneTwister19937.autoSeed());

/**
 * Grabs the key (for command invocation) from the incoming message.
 * @param content Incoming message content.
 */
export function extractKey(content: string): string {
  const start = content.split(" ")[0];
  const key = start.replace("!", "");
  console.log(`Key is ${key}`);
  return key.toLowerCase().trim();
}

// Init IFFE
(async () => {
  console.log("Loaded the following commands:");
  commands.forEach((c) => {
    console.log(` - !${c.definition.keys.join(", !")} - ${c.definition.name}`);
  });
})();

export async function handleMessage(message: Message) {
  const key = extractKey(message.content);
  if (!key) return; // Return early if key is empty.
  message.channel.startTyping();

  // The use of .every here allows us to quit as soon as a command is found.
  const result = commands.every((command) => {
    return command.definition.keys.every((cmdKey) => {
      if (cmdKey === key) {
        console.log(
          `${message.id} => Running the ${command.definition.name} command.`
        );

        // Start the command and respond if there are errors.
        command
          .action(message, cmdKey)
          .catch((err) => {
            console.error(`${message.id} => Threw an error.`);
            console.error(err);
            message
              .reply(
                `the !${cmdKey} command you ran threw an unhandled error: ` +
                  "`" +
                  err.toString() +
                  "`"
              )
              .catch(() => {
                console.error(
                  "Couldn't send a reply noting the error to the user."
                );
              });
          })
          .finally(() => {
            console.log(`${message.id} => Finished running.`);
          });

        // This loop can now exit and allow the promise to resolve.
        return false;
      }
      return true;
    });
  });

  // If a command was run
  if (result) {
    console.log(`${message.id} => Did not request a valid command.`);
    message
      .reply(
        `The key \`!${key}\` has no matching command, use \`!help\` to view a list of commands.`
      )
      .catch((err) => {
        console.error(
          "The bot probably lacks permissions to type in this channel."
        );
        console.error(err);
      });
  } else {
    console.log("Ran a command.");
  }

  message.channel.stopTyping(true);
}
