import { Message } from "discord.js";
import { Command, CommandDefinition, Action } from ".";
import fetch from "node-fetch";

export const description: CommandDefinition = {
  name: "Crypto Watcher",
  description:
    "Displays Crypto data (price, volume, change...) for the pair provided.",
  usage: ["!crypto <base-target>"],
  keys: ["crypto"],
};

export const action: Action = async (message: Message): Promise<any> => {
  const symbol = message.content.replace("!crypto ", "").toLowerCase();
  if (symbol === "") {
    message.channel.send(
      "I don't see a symbol... For example, you can do `!crypto BASE-TARGET`, i.e. `!crypto btc-usd`"
    );
    return;
  }

  return fetch(`https://api.cryptonator.com/api/ticker/${symbol}`)
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
      else {
        return message.channel.send(
          `**${symbol}** :chart_with_upwards_trend:\nCurrent: \`${
            res.ticker.price
          } ${res.ticker.target}\`\n24h Volume:\`${res.ticker.volume} ${
            res.ticker.base
          }\`\nPast Hour Change:\`${res.ticker.change} ${
            res.ticker.target
          }\`\nPast Hour Change Percentage:\`${
            Math.round((res.ticker.change / res.ticker.price) * 100 * 1000) /
            100
          }%\``
        );
      }
    })
    .catch((err: any) => {
      console.error(err);
      return message.channel.send(
        "Whoops... Looks like the API hit an error. Make sure the format you're using is `!crypto BASE-TARGET`. For example, `!crypto btc-usd`."
      );
    });
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
