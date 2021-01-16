import { Message } from "discord.js";
import { Command, CommandDefinition, Action } from ".";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const FMP_KEY = process.env.FMP_API_KEY || undefined;
const LIMIT_REACHED_RESULT = "Limit Reach";

export const description: CommandDefinition = {
  name: "Stonk Watcher",
  description:
    "Displays stock data (open, current, change...) for the symbol provided.",
  usage: ["!stonk <symbol>"],
  keys: ["stonk"],
};

export const action: Action = (message: Message, key) => {
  if (FMP_KEY === undefined) {
    message.channel.send("API Key Not Configured");
    return;
  }

  const symbol = message.content.replace("!stonk", "").toUpperCase();
  if (symbol === "") {
    message.channel.send(
      "I don't see a symbol... For example, you can do `!stonk ^DJI` or `!stonk goog`"
    );
    return;
  }

  fetch(
    `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${FMP_KEY}`
  )
    .then((response: any) => {
      if (response.status !== 200) throw new Error("API Not OK");
      return response.json();
    })
    .then((res: any) => {
      console.log(JSON.stringify(res));
      if (res === undefined || res.length === 0)
        // Result of an invalid symbol provided
        message.channel.send("Invalid Symbol provided, but you can try again!");
      else if (
        res["Error Message"]?.split(".")[0].trim() === LIMIT_REACHED_RESULT
      )
        // API Limit Reached
        message.channel.send(
          "API Limit Reached for the day, `!stonk` is on vacation!"
        );
      else
        message.channel.send(
          `**${symbol} - ${res[0].name}**\nCurrent: \`$${res[0].price}\`\nChange: \`${res[0].changesPercentage}%\`\nOpen: \`$${res[0].open}\`\nPrevious Close: \`$${res[0].previousClose}\``
        );
    })
    .catch((err: any) => {
      console.error(err);
      message.channel.send(
        "Whoops... Looks like the API hit an error, let's give it a break."
      );
    });
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
