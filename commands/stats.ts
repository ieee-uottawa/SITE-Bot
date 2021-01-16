import { Message } from "discord.js";
import { Command, CommandDefinition, Action } from ".";

export const description: CommandDefinition = {
  name: "Stat Hoarder",
  description: "Displays server statistics",
  usage: ["!stats"],
  keys: ["stats"],
};

export const action = (message : Message, key : string) => {
    const totalMembers= message.guild?.members.cache.size;  
    let botCount = message.guild?.members.cache.filter(m => m.user.bot).size; 
    if (botCount !== undefined) botCount++; // Bot doesn't include itself in the botCount lol

    //Get role counts
    let rollCounts : {rName:string; count:number}[] = [];
    const rolesJSON : any = message.guild?.roles.cache.toJSON(); // convert role Map Collection to JSON
    for (const key in rolesJSON) { // Iterate through each role object
      const roleData : any = rolesJSON[key];
      const roleName = roleData.name; 
      const roleCount = message.guild?.roles.cache.get(roleData.id)?.members.size || 0; // Is 0 if undefined

      // If the role is deleted, is @everyone, is a bot role, or has a count of 0, skip
      if (roleData.deleted || roleName === '@everyone' || roleName === 'YAGPDB.xyz' || roleCount === 0) 
        continue

      rollCounts.push({
        rName: roleName,
        count: roleCount
      }); 
    }
    
    let data = `Total Members: ${totalMembers}\nBot Count: ${botCount}\n`;
    for (var index in rollCounts) // Append all rollCounts to the final message to send
      data += `${rollCounts[index].rName} Members: ${rollCounts[index].count}\n`

    message.author.send(data);
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
