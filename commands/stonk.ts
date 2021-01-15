import { Message } from "discord.js";
import { Command, CommandDefinition, Action} from ".";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const FMP_KEY = process.env.FMP_API_KEY || undefined;

export const description: CommandDefinition = {
  name: "Stonk Watcher",
  description: "Displays stonk info for the symbol provided",
  usage: ["!stonk <symbol>"],
  keys: ["stonk"],
};

export const action: Action = (message, key) => {
  const symbol = message.content.replace("!stonk", "");
  if (symbol === "") return; 

  if (FMP_KEY === undefined) {
    message.channel.send("API Key Not Configured");
    return;
  }

  fetch(`https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${FMP_KEY}`)
  .then((data: any) => data.json())
  .then((res: any) => {
      let stockInfo;
      if (res === undefined || res.length === 0 ) // TODO: Figure out what happens to `res` when no API calls remain 
          stockInfo = "Error: Invalid Symbol, or No More Calls Remaining";
      else
          stockInfo = `${res[0].name}\nCurrent: $${res[0].price}\nChange: ${res[0].changesPercentage}%\nOpen: $${res[0].open}\nPrevious Close: $${res[0].previousClose}`
      message.channel.send(stockInfo);
  })
  .catch((err: any) => {
    
  });
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
