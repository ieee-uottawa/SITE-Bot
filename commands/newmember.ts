import { exception } from "console";
import {
  Collection,
  GuildMember,
  Message,
  Role,
  RoleResolvable,
} from "discord.js";
import { Command, CommandDefinition, Action } from ".";

export const description: CommandDefinition = {
  name: "Update New Member Role (Admin)",
  description:
    "Scans through the server's users and updates the New Member role. Adds the role to anybody with no class role, and removes it from people that have added a class.",
  usage: ["!newmember"],
  keys: ["newmember"],
};

var staffList = [
  "Admin",
  "Mod",
  "ESS",
  "CSSA",
  "IEEE",
  "Server Developer",
  "Server Booster",
  "Club Representative",
  "Bot",
  "Omnipotent",
];

function noperms(exception: any, message: Message) {
  message.reply(`I don't have permissions to set someone's role.`);
}

export const action: Action = async (message: Message): Promise<void> => {
  if (message.guild === null || message.member === null) {
    message.reply("Make sure you send this command in a server.");
    return;
  }

  //Check if the caller is a Mod or Admin
  if (
    message.member.roles.cache.some((role) => role.name === "Mod") ||
    message.member.roles.cache.some((role) => role.name === "Admin")
  ) {
    message.reply("Beginning scan...");

    //Get role for "New Member"
    let tempRole: Role | undefined = undefined;
    message.guild.roles.cache.every((role) => {
      if (role.name === "New Member") {
        tempRole = role;
        return false; // "Continue" and break the loop.
      }
      return true;
    });

    //If no such role, return
    if (!tempRole) {
      message.reply("No 'New Member' role. Go create one and try again.");
      return;
    }

    // If the role was found, set it to a constant.
    // @Vlad : I know this is dumb.
    const newMemberRole: Role = tempRole;

    let removedCount = 0;
    let addedCount = 0;

    // Iterate through ever member
    message.guild.members.cache.forEach((member) => {
      //If not staff and member roles don't contain a lowercase class code, append a "New Member Role"
      if (
        !(
          member.roles.cache.some((role) => staffList.includes(role.name)) ||
          member.roles.cache.some(
            (role) =>
              role.name.match(
                /(elg)|(ceg)|(csi)|(mcg)|(cvg)|(chg)|(chm)|(adm)|(anp)|(gng)|(iti)|(seg)|(eco)|(phi)|(his)|(mat)/g
              ) != null
          )
        )
      ) {
        //If member does not already have the new member role, add it
        if (!member.roles.cache.some((role) => role.name === "New Member")) {
          member.roles
            .add(newMemberRole)
            .catch((exception) => noperms(exception, message));
          addedCount++;
        }
      } else {
        //If member already has the new role, remove it
        if (member.roles.cache.some((role) => role.name === "New Member")) {
          member.roles.remove(newMemberRole);
          removedCount++;
        }
      }
    });
    message.reply(
      `Finished scan.\nAdded ${addedCount}.\nRemoved ${removedCount}.`
    );
  }
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
