import { Message, VoiceChannel, VoiceConnection } from "discord.js";
import puppeteer, { Browser, JSHandle, Page } from "puppeteer";
import { getBasicInfo, validateURL, videoInfo } from "ytdl-core";
import ytdl from "ytdl-core-discord";
import { Action, Command, CommandDefinition } from ".";
import { client } from "..";

type Song = {
  url: string;
  username: string;
};

const queue = new Map<string, Song>();

export const description: CommandDefinition = {
  name: "Music Control Commands",
  description: "Plays YouTube links or searches YouTube for keywords.",
  usage: [
    "!play <youtube url or search terms>",
    "!play toxic britney",
    "!stop",
  ],
  keys: ["play", "stop", "skip", "queue", "music", "volume"],
};

// Functions used by this command
// ==============================

const playSong = async (
  url: string,
  voiceChannel: VoiceChannel,
  message: Message
): Promise<any> => {
  console.log(`Playing song '${url}' ...`);
  return getBasicInfo(url)
    .then((info: videoInfo) => {
      return voiceChannel.join().then(async (x: VoiceConnection) => {
        x.voice?.setSelfDeaf(true); // Prevent eavesdropping like Groovy.
        const url = info.videoDetails.video_url;
        console.log(`Streaming ${url} to ${message.author.tag}`);
        const dispatch = x
          .play(
            await ytdl(url, { filter: "audioonly", highWaterMark: 1 << 100 }),
            { type: "opus", highWaterMark: 1 }
          )
          .on("finish", () => {
            message.react("💯");
          })
          .on("error", () => {
            message.react("🥵");
            message.react("🔥");
            message.reply(
              "Some sort of error occured while playing your song..."
            );
          })
          .on("close", () => {
            message.react("🛑");
          });
        // Default volume is lower to prevent blown out eardrums, ha.
        dispatch.setVolumeLogarithmic(1 / 3);
        return message.react("❤️");
      });
    })
    .catch((err) => {
      console.error(err);
    });
};

// Required Command Exports
// ========================

export const action: Action = async (
  message: Message,
  key: string
): Promise<any> => {
  // Get voice channel and permission status.
  const voiceChannel = message.member?.voice?.channel;
  if (!voiceChannel) return message.reply("Join a VC to play music.");
  const permissions = voiceChannel.permissionsFor(message.author);
  if (!permissions || !permissions.has("CONNECT") || !permissions.has("SPEAK"))
    return message.reply(
      "I need the permissions to join and speak in your voice channel!"
    );

  // Play or stop the posted song.
  if (key === "play") {
    const content: string[] = message.content.split(" ");
    if (content.length === 1) {
      message.reply(
        "...give me something to work with! A name or YouTube URL, perhaps?"
      );
      return;
    }
    const input: string = message.content.split(" ").splice(1).join("+").trim();

    if (validateURL(input)) {
      return playSong(input, voiceChannel, message);
    } else {
      if (input.toLowerCase().startsWith("http"))
        return message.reply(
          "That looks like a url, but... it's not on YouTube. Try pasting again?"
        );
      message.react("🔎");
      // Scrape for the title
      // https://iq.opengenus.org/scrapping-youtube-javascript/
      const query: string = input.replace(" ", "+");

      console.log(`INPUT QUERY: ${query}`);
      // puppeteer on heroku: https://stackoverflow.com/a/52228855
      return puppeteer
        .launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] })
        .then((browser: Browser) => {
          return browser.newPage().then(async (page: Page) => {
            // await page.setViewport({ width: 1920, height: 1080 });
            const searchUrl: string = `https://www.youtube.com/results?search_query=${query}`;
            console.log("Search URL is " + searchUrl);
            await page.goto(searchUrl);
            const firstVid = await page.waitForSelector("a#video-title");
            const urlElem: JSHandle | undefined = await firstVid?.getProperty(
              "href"
            );
            if (!urlElem)
              return message.reply("Er, sorry, couldn't find that.");

            // Everything is good:
            const url: string = urlElem._remoteObject.value.toString();
            message.react("✅");
            playSong(url, voiceChannel, message).catch((err) => {
              console.error(err);
              message.react("⚠️");
            });

            // Return a message with the song title:
            const textElem = await firstVid?.getProperty("textContent");
            if (!textElem) return;
            const text = textElem._remoteObject.value.toString().trim();
            browser.close();
            message.channel.send(
              `:musical_note:  Now playing *${text}*\nStreaming from ${"`"}${url.replace(
                "https://www.",
                ""
              )}${"`"}`
            );
          });
        })
        .catch((err) => {
          console.error(err);
          message.react("⚠️");
        });
    }
  } else if (key === "stop") {
    voiceChannel.leave();
  } else {
    message.reply("Sorry, @RyanFleck hasn't implemented this yet  :grimacing:");
  }
};

// Exports
// =======

export const command: Command = {
  definition: description,
  action: action,
};
export default command;
