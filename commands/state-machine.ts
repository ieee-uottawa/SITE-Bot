import { Message, MessageAttachment } from "discord.js";
import { Action, Command, CommandDefinition } from ".";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import axiosRetry from "axios-retry";

axiosRetry(axios, { retries: 3 });

export const description: CommandDefinition = {
  name: "Finite State Machine",
  description: "Returns a pretty image of an FSA.",
  usage: [
    "!fsm <[edge],[source],[target]>+ <start=[source]> <end=[target]>",
    "!fsm a,x,y b,x,z a,y,x b,y,z b,y,z a,z,z b,z,z start=x end=z",
  ],
  keys: ["fsm", "fsa"],
};

/**
 *
 *
 */

const endpoint: string = "https://fsa-svc-r3k4irmcka-nn.a.run.app/";
const config: AxiosRequestConfig = {
  headers: {
    "Content-Type": "application/json",
  },
};

type Data = {
  transitions: string;
  start: string;
  end: string;
  engine: string;
};

/**
 *
 * @param message Incoming Discord message.
 */
export const action: Action = async (message: Message): Promise<any> => {
  console.log("Getting FSM data...");
  const lowercaseMessage = message.cleanContent.toLowerCase();

  // Extract data from incoming message.
  const points: string[] =
    lowercaseMessage.match(/([a-z],[a-z],[a-z])/gm) || [];
  const start: string[] = lowercaseMessage.match(/(start=[a-z])/gm) || [];
  const end: string[] = lowercaseMessage.match(/(end=[a-z])/gm) || [];
  const engine: string[] = lowercaseMessage.match(/(end=[a-z])/gm) || [];

  // Return early if input is malformed.
  if (points.length < 2)
    return message.reply("Please provide at least two points like 'a,x,y, b,");
  if (start.length !== 1)
    return message.reply("Please provide one 'start=source' definition.");
  if (end.length !== 1)
    return message.reply("Please provide one 'end=target' definition.");

  const data: Data = {
    transitions: points.join(" "),
    start: start[0].charAt(start[0].length),
    end: end[0].charAt(start[0].length),
    engine: "dot",
  };

  console.log(JSON.stringify(data));

  return axios
    .post(endpoint, data, config)
    .then((res: AxiosResponse) => {
      // TODO: Process image in-memory to the correct format and return it.
      const attachment = new MessageAttachment(res.data, "fsm.png");
      return message.channel.send("Here's your FSM:", attachment);
    })
    .catch((err: any) => {
      console.error("This happened:");
      console.error(err);
      message.reply(
        "Er, the generator might be down? ```" + err.toString() + "```"
      );
    });
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
