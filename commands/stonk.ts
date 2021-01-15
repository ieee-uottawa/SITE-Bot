import { Message } from "discord.js";
import { Command, CommandDefinition } from ".";
import dotenv from "dotenv";

dotenv.config();
const fetch = require("node-fetch"); // Requiring fetch to make the stock API calls
const FMP_KEY = process.env.FMP_API_KEY; // This will need to be added in the .env file

export const description: CommandDefinition = {
  name: "Stonk Watcher",
  description: "Displays stonk info for the symbol provided",
  usage: ["!stonk", "!stonk <symbol>"],
  key: "stonk",
};
  
export const action = (message: Message) => {
    const symbol = message.content.replace("!stonk", "");
    fetch(`https://financialmodelingprep.com/api/v3/quote/${symbol === "" ? "^IXIC" : symbol}?apikey=${FMP_KEY}`)
    .then((data: any) => data.json())
    .then((res: any) => {
        let stockInfo;
        if (res === undefined || res.length === 0 ) // TODO: Figure out what happens to `res` when no API calls remain 
            stockInfo = "Error: Invalid Symbol, or No More Calls Remaining";
        else
            stockInfo = `${res[0].name}\nCurrent: $${res[0].price}\nChange: ${res[0].changesPercentage}%\nOpen: $${res[0].open}\nPrevious Close: $${res[0].previousClose}`
        message.channel.send(stockInfo);
    });
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
