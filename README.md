# SITE-Bot

![CI](https://github.com/ieee-uottawa/SITE-Bot/workflows/CI/badge.svg)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

The **SITE-Bot** runs on the SITE discord. To contribute a command, please read
[this section](#contribute-a-command).

As of 2021-10-05, the bot is automatically deployed to a container farm run by [@RyanFleck](https://github.com/RyanFleck)

<br />

#### Table of Contents

1. [Development](#development)
1. [Submitting a Pull Request](#submitting-a-pull-request)
1. [Philosophy](#philosophy)
1. [Contribute a Command](#contribute-a-command)
1. [More Complex Example](#more-complex-example)

<br />

## Development

We're always looking for more commands! Send us a pull request with your
contribution and we'll do our best to review and merge it.
See the [Contribute a Command](#contribute-a-command) section for
instructions on how to use the pluggable command architecture.

To test your additions, [set up a bot
app](https://discordjs.guide/preparations/setting-up-a-bot-application.html) on
a personal test server, and place your bot token in a `.env` file in the root of
the repository, like so:

```
# Required Keys
DISCORD_API_KEY=afs9J...
# Optional Keys
IBM_TRANSLATE_API_KEY=F8UpX...
IBM_TRANSLATE_API_URL=https://api.us-south.lang...
IBM_TONE_API_KEY=abcd...
IBM_TONE_API_URL=https://api.us-south.tone-anal...

FMP_API_KEY=0cd9....
```

Then run:

```sh
npm install
npm run develop
```

<br />

## Submitting a Pull request

Before submitting work, please ensure the following:

1. Run `npm run format` to format your code with prettier.
1. Ensure your code is clean and efficient; no unused variables or bad abstractions!

When adding new features, please use the following semantic labels for your PRs:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries such as documentation generation

<br />

## Philosophy

This section outlines some philosophical/moral things to keep in mind before making a PR.

### Purely Functional Commands

This is a purely functional bot; it provides tools for humans to use.

While contributions with additions that react and participate in conversations are cool, I have intentionally steered away from allowing pull requests adding this behavior for two reasons:

1. Though it'd provide a fun surprise once in a while, I don't want bots behaving as independent entities on the server. The conversation and discussions should be driven by people, and I feel it would cheapen the experience to have bots monitor and react to messages. In the interest of maximizing human agency (providing tools instead of analyzing and suggesting,) I don't want to include commands that analyze every message.

2. Privacy; I know there's no expectation for messages on the server being kept private, but running every message through a potentially large list of third-party API endpoints and libraries (depending on what contributors add in the future) is not something I'd like to subject people to.

Bots aren't people and should't react like them; I don't want to allow commands to be written that process data via third parties, and that means restricting all non-functional commands.

### Less Is More

Mounds of spaghetti code, or very dense code, present a very high mental load and result in
difficult (if not impossible) to maintain projects. When writing commands to submit to this
project, ask yourself these questions as you are programming:

- Am I using the _simplest possible solution_? Can I find a lazy way to do this?
- Can I make my work clearer (variable names, comments, breaking up long methods.)
- Is there a _more performant solution I am missing_? (filtering a large list vs checking a builtin variable for the same data)

<br />

## Contribute A Command

Here are the limitations and requirements for site-bot commands:

- Commands start with a _bang!_ We don't want to scrape all messages.
- Your command may only have one key, `!<key>`.
- If your command is called with your provided key, the message is yours to handle.
- Try to make as much use of promises/async as possible.
- **Abide by the types.**

It's easy to add a command to the **SITE Bot**, just add a file to the
`/commands` directory that exports a `Command` type object. Here's the
simplest command, `PingPong`. I'll walk you through how it works below.

```typescript
import { Message } from "discord.js";
import { Command, CommandDefinition } from ".";

export const description: CommandDefinition = {
  name: "Ping Pong",
  description: "Replies with 'Pong!'",
  usage: ["!ping"],
  keys: ["ping"],
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
import { Message } from "discord.js";
import { Command, CommandDefinition } from ".";
```

To register a command, you need to fill out a `CommandDefinition` object. This
is very important to do, as without the `key` field, we won't be able to provide
your functions with input.

```typescript
export const description: CommandDefinition = {
  name: "Ping Pong",
  description: "Replies with 'Pong!'",
  usage: ["!ping"],
  keys: ["ping"],
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

<br />

## More Complex Example

This is the code for the dice rolling command. It does a number of additional
things besides sending a message back:

- Breaks code into functions for better readability.
- Returns the user's tag so it is clear who the bot is responding to.
- Places limits on output to guarantee the message is under the 2000-character limit.
- `CommandDefinition` is placed at the top.
- `Exports` are placed at the bottom.

```typescript
import { Message } from "discord.js";
import { Command, CommandDefinition } from ".";

export const description: CommandDefinition = {
  name: "Dice Rollin' Bot",
  description: "Roll a die with any sides, default is 6.",
  usage: [
    "!roll <number of sides>",
    "!roll <number of dice> <number of sides>",
  ],
  keys: ["roll"],
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

/**
 * Returns a random number below the maximum.
 * @param max The highest possible roll.
 */
function getRandomInt(max: number): number {
  return 1 + Math.floor(Math.random() * Math.floor(max));
}

// Required Command Exports
// ========================

export const action = (message: Message) => {
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
    results.push(getRandomInt(dieData.num));
  }

  // Respond based on die size.
  const result = results.join(", ");
  const username = message.author.tag.split("#")[0];
  message.channel.send(
    `:game_die:  ${username} rolled ${
      dieData.volume === 1 ? "a" : dieData.volume
    } **D${dieData.num}** -> ${result}`
  );
};

// Exports
// =======

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
```

# Deployment

This application is designed for easy deployment on **Heroku**, but it would be just as easy to run with systemd on a linux box.

In `/etc/systemd/system/` create a new file named `site-bot.service`

```
[Unit]
Description=IEEE uOttawa SITE-Bot
After=network.target

[Service]
User=<username>
WorkingDirectory=/home/<username>/SITE-Bot
ExecStartPre=/home/<username>/.nvm/nvm-exec npm run build
ExecStart=/home/<username>/.nvm/nvm-exec npm start

Environment=DISCORD_API_KEY=Nzk5MDAyMzkxMzI3...
Environment=FMP_API_KEY=0cef2d31db19dae7bc95...
Environment=IBM_TONE_API_KEY=NsvlyuXtr9a6W8z...
Environment=IBM_TONE_API_URL=https://api.us-...
Environment=IBM_TRANSLATE_API_KEY=F8UpG4qr4x...
Environment=IBM_TRANSLATE_API_URL=https://ap...

[Install]
WantedBy=multi-user.target
```

Next you'll need to (as **superuser**) reload the service definitions and start, stop, or enable the service.

```sh
# In no particular order
systemctl daemon-reload     # reload service definitions
sytemctl start site-bot     # start the service
sytemctl stop site-bot      # stop the service
systemctl enable site-bot   # enable the service so it starts on boot
journalctl -f -u site-bot   # view logs
```
