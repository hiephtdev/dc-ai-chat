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
                
                // Filter out messages sent by the self-bot; keep only user messages
                const userMessages = messages.filter(msg => msg.author.id !== client.user.id);
                if (userMessages.size === 0) {
                    console.log("No user messages found. Skipping this cycle.");
                    await delay(config.delayMs);
                    continue;
                }
                
                // Select one random user message
                const randomIndex = Math.floor(Math.random() * userMessages.size);
                const selectedMessage = Array.from(userMessages.values())[randomIndex];

                // Build the prompt using the selected user message's content
                const prompt = selectedMessage.content;
                
                // Send the prompt to OpenAI to generate a question reply
                const completion = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        { 
                            role: "system", 
                            content: "You are a friendly, cheerful, and humorous chatbot that always responds with a question. Based on the user's message below, generate a relevant question as a reply. If the conversation is about a project, only discuss the fogochain project." 
                        },
                        { role: "user", content: prompt }
                    ],
                    max_tokens: 150
                });

                // Retrieve the response content
                const botResponse = completion.choices[0].message.content.trim();
                if (!botResponse) {
                    console.error("No response received from OpenAI!");
                    await delay(config.delayMs);
                    continue;
                }
                // Reply directly to the selected user message
                await selectedMessage.reply(botResponse);

                // Increment the counter and log the result
                chatCount++;
                console.log(`Sent message #${chatCount} in reply to ${selectedMessage.author.username}: ${botResponse}`);
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
