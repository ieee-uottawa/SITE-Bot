import { Command } from "../commands";

const intro = "**SITE-Bot - Help Menu**\n\n";

export const help = (commands: Command[]): string => {
  return (
    intro +
    commands
      .map(
        (c) =>
          `**${c.definition.name}**: ${
            c.definition.description
          }${c.definition.usage.map((u) => `\n\t${u}`)}\n`
      )
      .join("\n")
  );
};
