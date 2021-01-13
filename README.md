# SITE-Bot

The **SITE-Bot** runs on the SITE discord.

## Contribute A Command

It's easy to add a command to the **SITE Bot**, just add a file to the
`/commands` directory that exports a `Command` type object. Here's the simplest
command, `PingPong`. I'll walk you through how it works below.

```typescript
import { Command, CommandDefinition, Message } from ".";

export const description: CommandDefinition = {
  name: "Ping Pong",
  key: "ping",
};

export const action = (message: Message) => {
  message.channel.send("Pong.");
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
```

You could use this as a template:

```typescript
// Import types from the command index.ts file
import { Command, CommandDefinition, Message } from ".";

// Provide a description for your command.
export const description: CommandDefinition = {
  name: "", // Enter the bot name here
  key: "", // This comes immediately after the exclamation mark
};

// This function will be called when the key is detected in a message.
export const action = (message: Message) => {
  // Add stuff here, or calls to other functions, to run a command.
};

// This allows the system to register and listen for your command key.
export const command: Command = {
  definition: description,
  action: action,
};
export default command; // Leave this alone, we need it later.
```
