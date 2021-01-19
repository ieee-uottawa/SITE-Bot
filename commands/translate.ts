import { Message } from "discord.js";
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
    "!translate list (returns list of target languages)",
  ],
  keys: ["translate"],
};

/**
 * This command uses the IBM Watson Language Translator J1 resource. A 'Lite' plan
 * provides 1_000_000 characters of translation, including language detection
 * (though this isn't immediately disclosed in the API documentation.)
 *
 * You'll need to add the API Key and resource URL provided by IBM to use this command.
 */

// API Keys for IBM Translation Services
// =====================================

dotenv.config();
const apiKey = process.env.IBM_TRANSLATE_API_KEY?.toString() || "";
const apiURL = process.env.IBM_TRANSLATE_API_URL?.toString() || "";

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
  messageToTranslate: Message
) => {
  // Ensure the key/url are present, and return if not:
  if (!(apiKey && apiURL))
    throw new Error("Translation IBM Watson API Key or URL missing.");

  // Determine what to translate.
  // If it's just the bang-translate, proceed.
  const split: string[] = message.content.toLowerCase().split(" ");
  let text = messageToTranslate.content.trim();
  let language: string = ""; // Translate to French by default.
  if (split.length >= 3) {
    // First element might be a language code.
    text = split.slice(2).join(" ");
    language = split[1].toLowerCase();
  } else if (split.length === 2) {
    // Probably a language code, but if not, reply with an error.
    language = split[1].toLowerCase();
  } else {
    return translateIBM(text, "", "en-fr").then((translation) => {
      message.reply(`the French translation is '${translation}'`);
    });
  }

  // Gets the possible translation languages
  if (language == "list") {
    return translateList().then((languagelist) => {
      message.reply(
        `I can translate your input to the following languages:\n${languagelist}`
      );
    });
  }
  // Send to the translation engine.
  return translateIBM(text, language).then((translation) => {
    message.reply(`the translation to **${language}** is '${translation}'`);
  });
};

export const translateList = async (): Promise<string> => {
  // Performance of this method could potentially be improved by instantiating
  // the authentication and language translation objects outside of the
  // function. Problem is, I'm not sure how fast they expire.
  const languageTranslator = new LanguageTranslatorV3({
    version: "2018-05-01", // Is this really the latest, IBM docs? TODO: Find out.
    authenticator: new IamAuthenticator({
      apikey: apiKey,
    }),
    serviceUrl: apiURL,
  });
  let buildlist: string[] = []; // array will build with all supported language
  return languageTranslator.listLanguages().then((languages) => {
    languages.result.languages.forEach(function (value) {
      if (value.supported_as_target) {
        // check if the language is suported, if yes then it adds it to the buildlist array
        buildlist.push(
          `${value.country_code} - ${value.language_name}  (${value.native_language_name})`
        );
      }
    });
    let i = 1;
    const languagelist = "```" + buildlist.join("\n") + "```";
    return languagelist;
  });
};

export const translateIBM = async (
  text: string,
  language: string = "",
  model: string = ""
): Promise<string> => {
  // Performance of this method could potentially be improved by instantiating
  // the authentication and language translation objects outside of the
  // function. Problem is, I'm not sure how fast they expire.
  const languageTranslator = new LanguageTranslatorV3({
    version: "2018-05-01", // Is this really the latest, IBM docs? TODO: Find out.
    authenticator: new IamAuthenticator({
      apikey: apiKey,
    }),
    serviceUrl: apiURL,
  });

  if (language && model)
    throw new Error("Please provide a language OR model for translation.");

  // Build translation parameters.
  const translateParams: TranslateParams = { text: [text] };
  if (language) translateParams["target"] = language;
  if (model) translateParams["modelId"] = model;

  return languageTranslator.translate(translateParams).then((res) => {
    const translation = res.result.translations[0]["translation"];
    return translation;
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
