import { Command } from "../commands";

export const intro = "**SITE-Bot - Help Menu**\n\n";

export const help = (commands: Command[]): string => {
  return (
    intro +
    commands
      .map(
        (c) =>
          `**${c.definition.name}**: ${c.definition.description}\n\t${c.definition.usage}`
      )
      .join("\n")
  );
};
