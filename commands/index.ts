import { MersenneTwister19937, Random } from "random-js";
import { Message } from "discord.js";
import dotenv from "dotenv";
import Help, { command } from "./help";
import PingPong from "./pingpong";
import Dice from "./dice";
import Knowledge from "./knowledge";
import Contribute from "./contribute";
import Roulette from "./russian-roulette";
import Translate from "./translate";
import Stats from "./stats";
import Stonk from "./stonk";
import Spongebob from "./spongebob";
import Tone from "./tone";
import Remind from "./remind";
import Pet from "./pet";

import NewMember from "./newmember";

// To register a command, import it above and add it to this array.
export const commands: Command[] = [
  Help,
  Translate,
  Tone,
  Stonk,
  Dice,
  Stats,
  Knowledge,
  Spongebob,
  Roulette,
  Remind,
  NewMember,
  PingPong,
  Contribute,
  Pet,
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

export type Action = (message: Message, key: string) => void;

export function extractKey(content: string): string {
  const start = content.split(" ")[0];
  const key = start.replace("!", "");
  console.log(`Key is ${key}`);
  return key.toLowerCase();
}

export async function handleMessage<Promise>(message: Message) {
  console.log(`Handling message ${message.content}`);
  const key = extractKey(message.content);
  if (!key) return; // Return early if key is empty.

  // The use of .every here allows us to quit as soon as a command is found.
  commands.every((command) => {
    return command.definition.keys.every((cmdKey) => {
      if (cmdKey === key) {
        console.log(`Running the ${command.definition.name} command.`);
        message.channel.startTyping();
        try {
          // Run the command, passing the key to run sub-commands quickly.
          command.action(message, cmdKey);
        } catch (err) {
          // Last resort. Don't let your command call this!
          message.reply("`" + err.toString() + "`");
        }
        message.channel.stopTyping();
        return false;
      }
      return true;
    });
  });
}

export async function handleImages<Promise>(message: Message) {
  //test if the attchment is an image
  if (message.channel.id==process.env.DISCORD_PET_CHANEL){
    return Pet.action(message, "");
  }
}


// Init IFFE
(async () => {
  console.log("Loaded the following commands:");
  commands.forEach((c) => {
    console.log(` - !${c.definition.keys.join(", !")} - ${c.definition.name}`);
  });
})();

/**
 * The NodeJS Random engine is terrible, so import and use this instead
 */
export const random = new Random(MersenneTwister19937.autoSeed());
