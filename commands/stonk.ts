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

export const action: Action = async (message: Message): Promise<any> => {
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

  return fetch(
    `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${FMP_KEY}`
  )
    .then((response: any) => {
      if (response.status !== 200) throw new Error("API Not OK");
      return response.json();
    })
    .then((res: any) => {
      if (res === undefined || res.length === 0)
        // Result of an invalid symbol provided
        message.channel.send(
          "Invalid Symbol provided, but you can try again! :chart_with_upwards_trend:"
        );
      else if (
        res["Error Message"]?.split(".")[0].trim() === LIMIT_REACHED_RESULT
      )
        // API Limit Reached
        return message.channel.send(
          "API Limit Reached for the day, `!stonk` is on vacation! :chart_with_upwards_trend:"
        );
      else
        return message.channel.send(
          `**${symbol} - ${res[0].name}** :chart_with_upwards_trend:\nExchange: \`${res[0].exchange}\`\nCurrent: \`$${res[0].price}\`\nChange: \`${res[0].changesPercentage}%\`\nOpen: \`$${res[0].open}\`\nPrevious Close: \`$${res[0].previousClose}\``
        );
    })
    .catch((err: any) => {
      console.error(err);
      return message.channel.send(
        "Whoops... Looks like the API hit an error, let's give it a break."
      );
    });
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
