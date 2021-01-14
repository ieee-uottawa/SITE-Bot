import { Message } from "discord.js";
import { Command, CommandDefinition } from ".";
import fs from "fs";

type Sheet = {
  courseCode: string;
  path: string;
};

const sheets: Sheet[] = [];

// IFFE Init function: Loads all text files into memory.
(() => {
  console.log(`Operating in ${__dirname}`);
  fs.readdir(`${__dirname}/../../data/formula-sheets`, (err, files) => {
    if (err) {
      console.error(err);
    } else {
      // Load files.
      files.forEach((f) => {
        sheets.push({
          courseCode: f.replace(".txt", "").toUpperCase(),
          path: f,
        });
      });
      console.log(
        `Loaded the following cheat sheets: ${sheets
          .map((s) => s.courseCode)
          .join(", ")}`
      );
    }
  });
})();

export const description: CommandDefinition = {
  name: "Formula Sheets",
  description: "Prints common formulae for courses.",
  usage: "!sheet <course code>, or leave empty for list of courses.",
  key: "sheet",
};

export const action = (message: Message) => {
  console.log("Getting formula sheet...");
  const messageSplit = message.content.split(" ");

  if (messageSplit.length >= 2) {
    // If the course code is provided, return the cheat sheet.
    message.channel.send(
      `Attempting to get Formula Sheet for '**${messageSplit[1]}**'`
    );
  } else {
    // Return list of course codes if message does not have course code.
    message.channel.send(
      "**Available Formula Sheets:**\n" +
        ` - ${sheets.map((s) => s.courseCode).join("\n - ")}`
    );
  }
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
