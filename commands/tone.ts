import { Message } from "discord.js";
import { Action, Command, CommandDefinition } from ".";
import dotenv from "dotenv";
import { IamAuthenticator } from "ibm-watson/auth";
import ToneAnalyzerV3, { ToneParams } from "ibm-watson/tone-analyzer/v3";

export const description: CommandDefinition = {
  name: "Tone",
  description:
    "Analyzes the previous or provided message for the emotion, it will indicate all the emotion perseved from strongest to weakest if there is more then one",
  usage: ["!tone", "!tone <text?>"],
  keys: ["tone"],
};
/**
 * This command uses the IBM Watson Tone Analyzer resource. A 'Lite' plan
 * gets you started with 2,500 API calls per month at no cost.
 *
 * You'll need to add the API Key and resource URL provided by IBM to use this command.
 */

// API Keys for IBM Translation Services
// =====================================
dotenv.config();
const apiKey = process.env.IBM_TONE_API_KEY?.toString() || "";
const apiURL = process.env.IBM_TONE_API_URL?.toString() || "";

// Functions for Errors and Error Handling
// =======================================

function sendApology(message: Message, err: any) {
  message.channel.send(
    `:skull_crossbones:  An error occured during translation. :fire:\n ` +
      `Call 1-800-DEVELOPER if the message below looks bad enough.\n` +
      "```Error: " +
      err.toString() +
      "```"
  );
  console.error(err);
}
// Functions for Interacting with IBM APIs
// =======================================

export const translate = async (
  message: Message,
  messageToAnalyze: Message
) => {
  // Ensure the key/url are present, and return if not:
  if (!(apiKey && apiURL))
    throw new Error("Analyze Tone IBM Watson API Key or URL missing.");

  // Determine what to analyze.
  const split: string[] = message.content.split(" ");
  let text = "";
  // check if the message is after the !tone command
  if (split.length >= 2) {
    text = split.slice(1).join(" ");
  } else {
    text = messageToAnalyze.content.trim();
  }
  let cutText: string[] = text.split(" ");
  if (cutText.length >= 10) {
    text = cutText.slice(0, 10).join(" ") + " ...";
  }
  return analyzeTone(text).then((tone) => {
    messageToAnalyze.reply(`detected tone in "${text}": ${tone}`);
  });
};

export const analyzeTone = async (text: string): Promise<string> => {
  console.log(`Tonal analysis on '${text}'`);
  // Performance of this method could potentially be improved by instantiating
  // the authentication and language translation objects outside of the
  // function. Problem is, I'm not sure how fast they expire.
  const ToneAnalyzer = new ToneAnalyzerV3({
    version: "2017-09-21", // Is this really the latest, IBM docs? TODO: Find out.
    authenticator: new IamAuthenticator({
      apikey: apiKey,
    }),
    serviceUrl: apiURL,
  });

  if (text && "") throw new Error("No text to analyze!");

  // Build analyze parameters.
  const toneParams: ToneParams = {
    toneInput: { text: text },
    sentences: false,
  };
  let emotionList: string[] = [];
  return ToneAnalyzer.tone(toneParams).then((res) => {
    // orders the array to have the strongest emotion first and weaks last.
    res.result.document_tone.tones?.sort(
      (value1, value2) => value2.score - value1.score
    );
    res.result.document_tone.tones?.forEach(function (value) {
      emotionList.push(`${value.tone_name} (${value.score.toFixed(2)})`);
    });
    const emotion = emotionList.join(", ");
    if (emotion === "") return "Dead & Lifeless (No tonal data returned!)";
    return emotion;
  });
};
//
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
          translate(message, target).catch((err) => {
            sendApology(message, err);
          });
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
