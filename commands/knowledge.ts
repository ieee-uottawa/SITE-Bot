import axios from "axios";
import axiosRetry from "axios-retry";
import { Message } from "discord.js";
import { Action, Command, CommandDefinition } from ".";

axiosRetry(axios, { retries: 3 });

type WikiResponse = {
  title: string;
  displaytitle: string;
  wikibase_item: string;
  thumbnail: {
    source: string;
    width: number;
    height: number;
  };
  lang: string;
  description: string;
  content_urls: {
    desktop: {
      page: string;
    };
  };
  extract: string;
};

const endpoint = "https://en.wikipedia.org/api/rest_v1/page/random/summary";

export const description: CommandDefinition = {
  name: "Knowledge",
  description: "Returns a random timbit of knowledge.",
  usage: ["!knowledge"],
  keys: ["knowledge"],
};

export const action: Action = async (message: Message): Promise<void> => {
  return axios
    .get(endpoint)
    .then((res: any) => {
      const data: WikiResponse = res.data;
      message.reply(
        `look at this! An article on _${data.displaytitle}!_\n${data.content_urls.desktop.page}`
      );
    })
    .catch((err) => {
      console.error(err);
      message.reply(
        "Er, Wikipedia might be down? Call 1-800-DEVELOPERS to fix this."
      );
    });
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
