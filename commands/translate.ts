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
  usage: ["!translate <model?> (common: 'en-fr' or 'fr-en') <text?>"],
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
    `:skull_crossbones:  An error occured during translation. Call 1-800-DEVELOPER to fix.`
  );
  console.error(err);
}

// Functions for Extracting Data from Message

function getLanguageCode(text: string): string | undefined {
  // Ideally the second element of the message is passed to this function.
  text = text.replace("-", "").replace("_", "").trim();
  return undefined;
}

// Functions for Interacting with IBM APIs
// =======================================

export const translate = async (
  message: Message,
  messageToTranslate: Message
) => {
  // Ensure the key/url are present, and return if not:
  console.log(`APIKEY: ${apiKey}`);
  console.log(`APIURL: ${apiURL}`);
  if (!(apiKey && apiURL))
    throw new Error("Translation IBM Watson API Key or URL missing.");

  // Determine what to translate.
  // If it's just the bang-translate, proceed.
  const split: string[] = message.content.toLowerCase().split(" ");
  console.log(`[ '${split.join("', '")}' ]`);
  if (split.length >= 3) {
    // First element might be a language code, if not, translate normally.
    const langCode = getLanguageCode(split[1]);
  } else if (split.length === 2) {
    // Probably a language code, but if not, reply with an error.
    const langCode = getLanguageCode(split[1]);
  } else if (split.length === 1) {
    // Translate the previous message from English to French.
  }
  translateIBM(messageToTranslate.content, "fr").then((translation)=>{}).catch()
};

export const translateIBM = async (
  text: string,
  langModel: string
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
    target: "fr",
  };

  return languageTranslator.translate(translateParams).then((res) => {
    res.result.translations.forEach((t) => {
      console.log(t);
    });
    console.log(JSON.stringify(res, null, 2));
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
