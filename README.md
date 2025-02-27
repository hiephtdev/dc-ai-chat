# Discord Self-Bot Chat with OpenAI

This project is a self-bot for Discord that uses the OpenAI API to generate chat responses based on the 50 most recent messages in a specific channel. The self-bot continuously sends generated messages to a designated channel on a server, with a configurable delay between each message.

**WARNING:** Using a self-bot (automating a regular user account) on Discord violates the [Discord Terms of Service](https://discord.com/terms) and may result in your account being banned. Use this code at your own risk.

## Features

- Retrieves the 50 most recent messages from a specified channel.
- Generates a chat response using the OpenAI API (gpt-4o-mini).
- Sends the generated response to the Discord channel.
- Configurable delay between each sent message.
- Counts and logs the number of messages sent.

## Requirements

- Node.js (version 14 or above recommended)
- A personal Discord account (note that using a self-bot risks getting your account banned)
- **UserToken** for your Discord account
- **OpenAI API key**

## Installation

1. **Clone the repository:**

   ```bash
   git clone <REPOSITORY_URL>
   cd <REPOSITORY_FOLDER>
   ```

2. **Install the necessary packages:**

   ```bash
   npm install
   ```

## Configuration

Create a `config.json` file in the root directory of the project with the following content:

```json
{
  "userToken": "YOUR_DISCORD_USER_TOKEN",
  "openaiApiKey": "YOUR_OPENAI_API_KEY",
  "guildId": "YOUR_GUILD_ID",
  "channelId": "YOUR_CHANNEL_ID",
  "delayMs": 5000
}
```

- **userToken:** The authentication token for your personal Discord account. (You can retrieve this token by opening the Developer Console on Discord Web and executing `window.localStorage.getItem('token')`, though this method violates Discord's Terms of Service.)
- **openaiApiKey:** Your API key for OpenAI.
- **guildId:** The ID of the server (guild) that contains the channel. For example, in the URL `https://discord.com/channels/1326926340603252838/1330374920236171264`, `1326926340603252838` is the guildId.
- **channelId:** The ID of the channel where the chat occurs. For example, `1330374920236171264` is the channelId.
- **delayMs:** The delay between each message sent (in milliseconds).

## Running the Application

To start the self-bot, run the following command in your terminal:

```bash
node bot.js
```

The self-bot will:
- Log into Discord using the `userToken`.
- Fetch the 50 most recent messages from the specified channel.
- Construct a prompt based on those messages.
- Send the prompt to OpenAI to generate a response.
- Post the generated response to the Discord channel.
- Wait for the configured delay before repeating the process.

## Important Notes

- **WARNING:** Using a self-bot violates Discord's Terms of Service and may result in your account being locked or banned. Use this code at your own risk.
- Keep your **userToken** secure and do not share it publicly.

## License

This project is provided "as is" without any warranties. Feel free to modify and use it as needed.
