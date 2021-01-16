import { Message, UserManager } from "discord.js";
import { Action, Command, CommandDefinition } from ".";
import dotenv from "dotenv";
import { IamAuthenticator } from "ibm-watson/auth";
import LanguageTranslatorV3, {
  TranslateParams,
} from "ibm-watson/language-translator/v3";

export const description: CommandDefinition = {
  name: "Translate",
  description:
    "Translates the previous or provided message from English to French by default, or any other language.",
  usage: [
    "!translate <language?> (translates last msg sent, even those sent by others)",
    "!translate <language> <text?>",
  ],
  keys: ["translate"],
};

// API Keys for IBM Translation Services
// =====================================

dotenv.config();
const apiKey = process.env.IBM_TRANSLATE_API_KEY?.toString() || "";
const apiURL = process.env.IBM_TRANSLATE_API_URL?.toString() || "";

// Functions for Errors and Error Handling
// =======================================

function sendApology(message: Message, err: any) {
  message.channel.send(
    `:skull_crossbones:  An error occured during translation.\n ` +
      `Call 1-800-DEVELOPER to fix. Please don't use this endpoint again ` +
      `until a server developer OKs it.\n` +
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
  messageToTranslate: Message
) => {
  // Ensure the key/url are present, and return if not:
  if (!(apiKey && apiURL))
    throw new Error("Translation IBM Watson API Key or URL missing.");

  // Determine what to translate.
  // If it's just the bang-translate, proceed.
  const split: string[] = message.content.toLowerCase().split(" ");
  let text = messageToTranslate.content.trim();
  let language = "French"; // Translate to French by default.
  if (split.length >= 3) {
    // First element might be a language code.
    text = split.slice(2).join(" ");
    language = split[1].toLowerCase();
  } else if (split.length === 2) {
    // Probably a language code, but if not, reply with an error.
    language = split[1].toLowerCase();
  }

  // Send to the translation engine.
  return translateIBM(text, language).then((translation) => {
    message.reply(`the translation to **${language}** is '${translation}'`);
  });
};

export const translateIBM = async (
  text: string,
  language: string
): Promise<string> => {
  const languageTranslator = new LanguageTranslatorV3({
    version: "2018-05-01", // Is this really the latest, IBM docs? TODO: Find out.
    authenticator: new IamAuthenticator({
      apikey: apiKey,
    }),
    serviceUrl: apiURL,
  });

  const translateParams: TranslateParams = {
    text: [text],
    target: language,
  };

  return languageTranslator.translate(translateParams).then((res) => {
    const translation = res.result.translations[0]["translation"];
    return translation;
  });
};

// Command Action Function
// =======================

export const action: Action = (message: Message) => {
  message.channel.messages.fetch().then((messageList) => {
    // messageList now contains the last few messages.
    if (messageList)
      messageList.every((target) => {
        // Continue the loop if the message was from a bot or a bot command.
        if (target.author.bot) return true;
        if (target.content.startsWith("!")) return true;
        translate(message, target).catch((err) => {
          sendApology(message, err);
        });
        return false;
      });
  });
};

// Command Exports
// ===============

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
