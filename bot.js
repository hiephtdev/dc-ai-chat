// Import các thư viện cần thiết
const Discord = require('discord.js-selfbot-v13');
const { OpenAI } = require('openai');
const fs = require('fs');

// Đọc file cấu hình (config.json)
const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

// Cấu hình OpenAI
const openaiConfig = {
    apiKey: config.openaiApiKey,
};
const openai = new OpenAI(openaiConfig);

// Tạo client cho self-bot
const client = new Discord.Client();

// Biến đếm số câu chat đã gửi
let chatCount = 0;

// Hàm delay (trả về Promise)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Khi đăng nhập thành công
client.on('ready', async () => {
    console.log(`Đã đăng nhập với tài khoản: ${client.user.tag}`);
    // Bắt đầu vòng lặp chat
    chatLoop();
});

// Hàm thực hiện vòng lặp chat
async function chatLoop() {
    try {
        // Lấy guild (server) theo ID từ file cấu hình
        const guild = await client.guilds.fetch(config.guildId);
        if (!guild) {
            console.error("Không tìm thấy server (guild)!");
            return;
        }
        // Lấy đối tượng kênh từ guild
        const channel = await guild.channels.fetch(config.channelId);
        if (!channel) {
            console.error("Không tìm thấy kênh chat!");
            return;
        }

        while (true) {
            try {
                // Lấy 50 tin nhắn mới nhất từ kênh
                const messagesCollection = await channel.messages.fetch({ limit: 100 });
                // Sắp xếp theo thời gian từ cũ đến mới
                const messages = messagesCollection.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

                // Xây dựng prompt dựa trên các tin nhắn
                let prompt = "";
                messages.forEach(msg => {
                    prompt += `${msg.content}\n`;
                });

                // Gửi prompt đến OpenAI để tạo phản hồi
                const completion = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: "Bạn là một bot trò chuyện thân thiện, vui vẻ, hài hước và luôn trò chuyện ngắn gọn không quá 10.\nDựa vào ngữ cảnh hiện tại của đoạn chat cho tôi 1 câu chat tiếp theo phù hợp đủ nghĩa" },
                        { role: "user", content: prompt }
                    ],
                    max_tokens: 150
                });

                // Lấy nội dung phản hồi
                const botResponse = completion.choices[0].message.content.trim();
                if (!botResponse) {
                    console.error("Không có phản hồi từ OpenAI!");
                    return;
                }
                // Gửi phản hồi lên kênh Discord
                await channel.send(botResponse);

                // Tăng bộ đếm và log kết quả
                chatCount++;
                console.log(`Đã gửi tin nhắn thứ ${chatCount}: ${botResponse}`);
            } catch (error) {
                console.error("Có lỗi xảy ra trong vòng lặp chat:", error);
            }

            // Delay theo khoảng thời gian cấu hình trước khi lặp lại
            await delay(config.delayMs);
        }
    } catch (error) {
        console.error("Có lỗi xảy ra khi fetch guild hoặc channel:", error);
    }
}

// Đăng nhập với token tài khoản người dùng (self-bot)
client.login(config.userToken);
