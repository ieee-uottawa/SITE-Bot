import { Message } from "discord.js";
import { Command, CommandDefinition, Action } from ".";

// Allows for proper organization of the roll counts
const PROGRAMS: string[] = [
  "CEG",
  "CSI",
  "SEG",
  "ELG",
  "CHG",
  "CVG",
  "BMG",
  "MCG",
  "COMP TECH",
];
const YEARS: string[] = [
  "1st year",
  "2nd year",
  "3rd year",
  "4th year",
  "5th year",
  "upper year",
];
const ASSOCIATIONS: string[] = ["IEEE", "CSSA", "ESS"];
const PRONOUNS: string[] = ["he/him", "she/her", "they/them"];

export const description: CommandDefinition = {
  name: "Server Stat Hoarder",
  description: "Displays user and role statistics.",
  usage: ["!stats"],
  keys: ["stats"],
};

export const action = (message: Message, key: string) => {
  if (!message.guild) {
    message.author.send("Call me in a server!");
    return;
  }
  const totalCount = message.guild.memberCount;
  const botCount = message.guild.members.cache.filter((m) => m.user.bot).size;
  const userCount = totalCount - botCount;

  // Count users who are still categorized as "New Member"
  const newMemberRoleID = message.guild.roles.cache.find(
    (r) => r.name === "New Member"
  )?.id!;
  const newMemberCount = message.guild.members.cache.filter((m) =>
    m.roles.cache.has(newMemberRoleID)
  ).size;

  //Get role counts - organized under year, program, association, pronoun & miscellaneous
  let rollCounts: { [key: string]: string[] } = {
    year: [],
    program: [],
    assoc: [],
    pronoun: [],
    misc: [],
  };

  // convert role Map Collection to JSON
  const rolesJSON: any = message.guild.roles.cache.toJSON();
  for (const key in rolesJSON) {
    // Iterate through each role object
    const roleData: any = rolesJSON[key];
    const roleName = roleData.name;
    const roleCount =
      message.guild.roles.cache.get(roleData.id)?.members.size || 0; // Is 0 if undefined

    // Do not include any of the roles satisfying any of these criterias:
    if (
      roleData.deleted ||
      roleCount === 0 ||
      roleName === "@everyone" ||
      roleName === "YAGPDB.xyz" ||
      roleName === "Bot" ||
      roleName === "New Member" || // Skip New Member role (we already have it)
      roleName.toLowerCase().match(/([a-z][a-z][a-z][0-9][0-9][0-9][0-9])/g) // Skip all course code roles
    )
      continue;

    if (YEARS.indexOf(roleName) !== -1)
      rollCounts.year.push(`\`${roleName}: ${roleCount}\``);
    else if (ASSOCIATIONS.indexOf(roleName) !== -1)
      rollCounts.assoc.push(`\`${roleName}: ${roleCount}\``);
    else if (PROGRAMS.indexOf(roleName) !== -1)
      rollCounts.program.push(`\`${roleName}: ${roleCount}\``);
    else if (PRONOUNS.indexOf(roleName) !== -1)
      rollCounts.pronoun.push(`\`${roleName}: ${roleCount}\``);
    else rollCounts.misc.push(`\`${roleName}: ${roleCount}\``);
  }

  let data = `here are the user stats for **${message.guild?.name}**  :bar_chart: \n\`User Count: ${userCount}\`\n\`Bot Count: ${botCount}\`\n\`New Member Count: ${newMemberCount}\`\n`;

  if (rollCounts.year.length > 0)
    data += rollCounts.year.sort().join("\n") + `\n`;

  if (rollCounts.assoc.length > 0) data += rollCounts.assoc.join("\n") + `\n`;

  if (rollCounts.program.length > 0)
    data += rollCounts.program.join("\n") + `\n`;

  if (rollCounts.pronoun.length > 0)
    data += rollCounts.pronoun.join("\n") + `\n`;

  if (rollCounts.misc.length > 0) data += rollCounts.misc.join("\n");

  // Finally, reply to the user:
  message.reply(data);
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
