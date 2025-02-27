// Import required libraries
const Discord = require('discord.js-selfbot-v13');
const { OpenAI } = require('openai');
const fs = require('fs');

// Read the configuration file (config.json)
const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

// Configure OpenAI
const openaiConfig = {
    apiKey: config.openaiApiKey,
};
const openai = new OpenAI(openaiConfig);

// Create the client for the self-bot
const client = new Discord.Client();

// Counter for the number of chat messages sent
let chatCount = 0;

// Delay function (returns a Promise)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// When successfully logged in
client.on('ready', async () => {
    console.log(`Logged in as: ${client.user.tag}`);
    // Start the chat loop
    chatLoop();
});

// Function to perform the chat loop
async function chatLoop() {
    try {
        // Fetch the guild (server) using the ID from the configuration file
        const guild = await client.guilds.fetch(config.guildId);
        if (!guild) {
            console.error("Guild (server) not found!");
            return;
        }
        // Fetch the channel object from the guild
        const channel = await guild.channels.fetch(config.channelId);
        if (!channel) {
            console.error("Chat channel not found!");
            return;
        }

        while (true) {
            try {
                // Fetch the most recent 100 messages from the channel
                const messagesCollection = await channel.messages.fetch({ limit: 100 });
                // Sort messages from oldest to newest
                const messages = messagesCollection.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

                // Build the prompt based on the messages
                let prompt = "";
                messages.forEach(msg => {
                    prompt += `${msg.content}\n`;
                });

                // Send the prompt to OpenAI to generate a response
                const completion = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        { 
                            role: "system", 
                            content: "You are a friendly, cheerful, and humorous chatbot that always responds briefly (no more than 10 words). Based on the current chat context, provide a meaningful next chat message." 
                        },
                        { role: "user", content: prompt }
                    ],
                    max_tokens: 150
                });

                // Retrieve the response content
                const botResponse = completion.choices[0].message.content.trim();
                if (!botResponse) {
                    console.error("No response received from OpenAI!");
                    return;
                }
                // Send the response to the Discord channel
                await channel.send(botResponse);

                // Increment the counter and log the result
                chatCount++;
                console.log(`Sent message #${chatCount}: ${botResponse}`);
            } catch (error) {
                console.error("An error occurred in the chat loop:", error);
            }

            // Delay for the configured time before repeating
            await delay(config.delayMs);
        }
    } catch (error) {
        console.error("An error occurred while fetching guild or channel:", error);
    }
}

// Log in using the user account token (self-bot)
client.login(config.userToken);
