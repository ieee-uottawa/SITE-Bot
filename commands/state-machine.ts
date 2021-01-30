import { Message, MessageAttachment } from "discord.js";
import { Action, Command, CommandDefinition } from ".";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import axiosRetry from "axios-retry";

axiosRetry(axios, { retries: 3 });

export const description: CommandDefinition = {
  name: "Finite State Machine",
  description: "Returns a pretty image of an FSA. Takes optional start, end, and engine parameters.",
  usage: [
    "!fsm <[edge],[source],[target]>+ <start=[source]> <end=[target]> <engine=[engine]>",
    "!fsm a,x,y b,x,z a,y,x b,y,z b,y,z a,z,z b,z,z start=x end=z",
    "!fsm a,x,y b,x,z a,y,x b,y,z b,y,z a,z,z b,z,z",
  ],
  keys: ["fsm", "fsa"],
};

/**
 * Thanks to @taliamax for the pyfsa <https://github.com/taliamax/pyfsa> tool.
 * Calls a deployed copy of the tool in a flask app: <https://github.com/taliamax/fsa-svc>
 */

const endpoint: string = "https://fsa-svc-r3k4irmcka-nn.a.run.app/";
const config: AxiosRequestConfig = {
  responseType: "stream", // This is critical; without it, you'll just get the first few bits of the image.
  headers: {
    "Content-Type": "application/json",
  },
};

type Data = {
  transitions: string;
  start?: string;
  end?: string;
  engine?: string;
};

export const action: Action = async (message: Message): Promise<any> => {
  const lowercaseMessage = message.cleanContent.toLowerCase();

  // Extract data from incoming message.
  const points: string[] =
    lowercaseMessage.match(/([a-z],[a-z],[a-z])/gm) || [];
  const start: string[] = lowercaseMessage.match(/(start=[a-z])/gm) || [];
  const end: string[] = lowercaseMessage.match(/(end=[a-z])/gm) || [];
  const engine: string[] = lowercaseMessage.match(/(engine=[a-z]+)/gm) || [];

  const data: Data = {
    transitions: points.join(" "),
  };

  // Return early if input is malformed.
  if (points.length < 1)
    return message.reply("Please provide at least two points and an edge, like 'a,x,y'");
  if (start.length > 1)
    return message.reply("Please provide just one 'start=source' definition.");
  if (end.length > 1)
    return message.reply("Please provide just one 'end=target' definition.");
  if (engine.length > 1)
    return message.reply("Please provide just one 'engine' definition.");

  // Add additional input if provided.
  if (start.length === 1) data.start = start[0].charAt(start[0].length);
  if (end.length === 1) data.end = end[0].charAt(start[0].length);
  if (engine.length === 1) data.engine = engine[0].split("=")[1];

  console.log(`Calling fsa-svc with data: ${JSON.stringify(data)}`);  

  return axios
    .post(endpoint, data, config)
    .then(async (res: AxiosResponse) => {
      const attachment = new MessageAttachment(res.data, "fsm.png");
      return message.channel.send("Here's your FSM:", attachment);
    })
    .catch((err: any) => {
      console.error("This happened:");
      console.error(err.toString());
      message.reply(
        "Er, the fsa-svc deployment might be down? ```" + err.toString() + "```"
      );
    });
};

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
