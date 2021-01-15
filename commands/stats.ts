import { Message } from "discord.js";
import { Command, CommandDefinition } from ".";

export const description: CommandDefinition = {
  name: "Stat Hoarder",
  description: "Displays server statistics",
  usage: ["!stats"],
  key: "stats",
};

export const action = (message: Message) => {
    const totalMembers= message.guild?.members.cache.size;  
    let botCount = message.guild?.members.cache.filter(m => m.user.bot).size; 
    if (botCount !== undefined) botCount++; // Bot doesn't include itself in the botCount lol

    //Get role counts
    let rollCounts : {rName:string; count:number}[] = [];

    const rolesJSON = message.guild?.roles.cache.toJSON();
    for (const key in rolesJSON) {
      const roleData = rolesJSON[key]; // TODO - figure out warning 
      console.log(roleData);
      if (roleData.deleted || roleData.name === '@everyone' || roleData.name === 'YAGPDB.xyz') 
        continue
      
      rollCounts.push({
        rName: roleData.name,
        count: message.guild?.roles.cache.get(roleData.id)?.members.size!
      }); 
    }
    
    var data = `Total Members: ${totalMembers}\nBot Count: ${botCount}\n`;
    for (var index in rollCounts) {
      data += `${rollCounts[index].rName} Members: ${rollCounts[index].count}\n`
    }
    message.author.send(data);
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
