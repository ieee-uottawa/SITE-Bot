# SITE-Bot

The **SITE-Bot** runs on the SITE discord.

## Development

We're always looking for more commands! Send us a pull request with your
contribution and we'll do our best to review and merge it.

To test your additions, [set up a bot
app](https://discordjs.guide/preparations/setting-up-a-bot-application.html) on
a personal test server, and place your API key in a `.env` file in the root of
the repository. Then run:

```sh
npm install
npm run develop
```

## Contribute A Command

It's easy to add a command to the **SITE Bot**, just add a file to the
`/commands` directory that exports a `Command` type object. Here's the
simplest command, `PingPong`. I'll walk you through how it works below.

```typescript
import { Command, CommandDefinition, Message } from ".";

export const description: CommandDefinition = {
  name: "Ping Pong",
  description: "Replies with 'Pong!'",
  usage: "!ping",
  key: "ping",
};

export const action = (message: Message) => {
  message.channel.send("Pong! Wow, the bot works!");
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
```

Each of these objects is important for registering your command.

I'll go through the `pingpong.ts` file step by step to better express what's
going on.

First, we need to import some types from `commands/index.ts`

```typescript
import { Command, CommandDefinition, Message } from ".";
```

To register a command, you need to fill out a `CommandDefinition` object. This
is very important to do, as without the `key` field, we won't be able to provide
your functions with input.

```typescript
export const description: CommandDefinition = {
  name: "Ping Pong",
  description: "Replies with 'Pong!'",
  usage: "!ping",
  key: "ping",
};
```

The action function can be named anything, but it must take a Discord.js message
object and be included in the default export, the `Command` object. Check out
the [Discord.js API](https://discord.js.org/#/docs/main/stable/class/Message) to see the properties of `message`.

```typescript
export const action = (message: Message) => {
  message.channel.send("Pong! Wow, the bot works!");
};
```

Finally, you'll need to make one of these. Provide your `CommandDefinition`
object and action function, and you're almost good to go.

```typescript
export const command: Command = {
  definition: description,
  action: action,
};
export default command;
```

The **final step** is to import your new command in `commands/index.ts` and add
it to the commands array. This will ensure that, when messages come in, they
will be checked against all current command **keys** and functions with matching
keys will be run.

```typescript
import PingPong from "./pingpong";
import Dice from "./dice";

const commands: Command[] = [PingPong, Dice];
```

## Slightly More Complex Example

```typescript
import { Command, CommandDefinition, Message } from ".";

// Functions used by this command
// ==============================

/**
 * Uses a regex to extract the first number given by the user.
 * @param content The message provided by the user.
 */
function parseDieSize(content: string): number {
  const match = content.match(/\d+/);
  if (match && match[0]) {
    const num = parseInt(match[0]);
    console.log(`Got a die size: ${num}`);
    return num;
  }
  return 0;
}
/**
 * Returns a random number below the maximum.
 * @param max The highest possible roll.
 */
function getRandomInt(max: number) {
  return 1 + Math.floor(Math.random() * Math.floor(max));
}

// Required Command Exports
// ========================

export const description: CommandDefinition = {
  name: "Dice Rollin' Bot",
  description: "Roll a die with any sides, default is 6.",
  usage: "!roll <number of sides>",
  key: "roll",
};

export const action = (message: Message) => {
  // Extract die size from message.
  const dieSize = parseDieSize(message.content);
  // Respond based on die size.
  if (dieSize && dieSize > 1000) {
    message.channel.send(`Ugh, I can't roll a die that size!`);
  } else if (dieSize && dieSize > 0) {
    const result = getRandomInt(dieSize);
    message.channel.send(`:game_die: Rolling a D${dieSize} -> **${result}**`);
  } else {
    // If die size could not be parsed, roll a D6.
    const result = getRandomInt(6);
    message.channel.send(`:game_die: Rolling a D6 -> **${result}**`);
  }
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
```
