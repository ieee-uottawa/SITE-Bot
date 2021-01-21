import { DiscordAPIError, Message } from "discord.js";
import { Action, Command, CommandDefinition, random } from ".";
import Canvas from "canvas";
import Discord from "discord.js";

export const description: CommandDefinition = {
  name: "Spongebobify",
  description: "Parrots the previously posted message in slow spongebob.",
  usage: ["!spongebobify or !spongebob or !sb"],
  keys: ["spongebobify", "spongebob", "sb"],
};

/**
 * Alright, let's see how long this function can last before the mods
 * demand the feature is removed or ban the bot. Should be fun.
 */

// Functions for Errors and Error Handling
// =======================================

function sendApology(message: Message, err: any) {
  message.channel.send(
    `:skull_crossbones:  An error occured during spongebobification. :fire:\n ` +
      `Call 1-800-DEVELOPER if the message below looks bad enough.\n` +
      "```Error: " +
      err.toString() +
      "```"
  );
  console.error(err);
}

function spongebobify(text: string): string {
  const split = text.toLowerCase().split("");
  const noSpecials = split.filter((char) => {
    // Don't return discord styling tokens.
    if (char === "*" || char === "_" || char === "^") return false;
    return true;
  });
  const uPpEr = noSpecials.map((char) => {
    if (random.bool()) return char.toUpperCase(); // Half are upper.
    if (char === " ") return "  "; // Spaces to double spaces
    if (random.bool()) return char + " "; // Extra spaces sometimes
    return char;
  });
  return uPpEr.join("");
}
export const memeMaker = async (
  message: Message,
  spongebobifyText: string
) => {
  const fontsize=50//number of px for the font.
  const width=750;
  let textLines: string[]=[];
  let tempArray: string[]=[];
  let lastString: string="";
  //create the default canvas
  const canvas = Canvas.createCanvas(width,width);
  const ctx = canvas.getContext('2d');
  const split=spongebobifyText.replace("\n"," ").split(" ");
  //creates every line and making sure they fit in our width.
  ctx.font=fontsize+'px Calibri';
  for (let index = 0; index < split.length; index++) {
    tempArray.push(split[index]);
    let tempString= spongebobify(tempArray.join(" "));
    if(ctx.measureText(tempString).width>width*(1-(fontsize*.4)/width)){
      textLines.push(lastString);
      lastString="";
      tempArray=[];
    }else{
      lastString=tempString;
    }
  }
  if(lastString.replace(" ","").length>0){
  textLines.push(lastString);
  }
  const background = await Canvas.loadImage('./imagerepo/spongebob.jpg');//load spongebob image
  const picRatio=background.naturalHeight/background.naturalWidth;
  canvas.height=width*picRatio+fontsize*1.2*textLines.length+fontsize*.4;// resize canvas
  //create white box
  ctx.fillStyle='#ffffff';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  //add spongebob image
  ctx.drawImage(background,0,(canvas.height-canvas.width*picRatio), canvas.width, canvas.width*picRatio);
  //create text
  ctx.fillStyle='#000000';
  ctx.font=fontsize+'px Calibri';
  for (let index = 0; index < textLines.length; index++) {
    ctx.fillText(textLines[index],fontsize*.2,fontsize*1.2*(index+1));
  }
  //post meme
  const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'spongebobify_meme.png');
  message.channel.send(attachment);
};
// Command Action Function
// =======================

export const action: Action = (message: Message) => {
  message.channel.messages
    .fetch()
    .then((messageList) => {
      // messageList now contains the last few messages.
      if (messageList) {
        const res = messageList.every((target) => {
          // Continue the loop if the message was from a bot or a bot command.
          if (target.author.bot) return true;
          if (target.content.startsWith("!")) return true;
          if (!target.content || target.content.trim() === "") return true;
          // Spongebobify the message and return.
          memeMaker(target, target.content);
          //target.channel.send(spongebobify(target.content));
          return false;
        });
        if (res === true) {
          message.channel.send(
            ":confounded:  The last few messages are bot commands, media, and invocations..."
          );
        }
      } else {
        throw new Error("Hm, I couldn't grab the last few messages.");
      }
    })
    .catch((err) => {
      sendApology(message, err);
    });
};

// Command Exports
// ===============

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
