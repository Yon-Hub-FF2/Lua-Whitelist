const { Client, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const WHITELIST_FILE = './whitelist.json';
let whitelist = {};

if (fs.existsSync(WHITELIST_FILE)) {
  whitelist = JSON.parse(fs.readFileSync(WHITELIST_FILE, 'utf-8'));
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async message => {
  if (!message.content.startsWith('!wl') || message.author.bot) return;

  const args = message.content.slice(3).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'add') {
    if (!message.member.permissions.has('Administrator')) return message.reply("No perms.");
    const user = message.mentions.users.first();
    if (!user) return message.reply("Mention someone.");

    const robloxId = args[1];
    if (!robloxId || isNaN(robloxId)) return message.reply("Provide Roblox UserId: !wl add @user 123456789");

    whitelist[robloxId] = { discord: user.id, added: Date.now() };
    saveWhitelist();
    message.reply(`Whitelisted Roblox ID **${robloxId}**`);
  }

  if (command === 'remove') {
    const robloxId = args[0];
    if (whitelist[robloxId]) {
      delete whitelist[robloxId];
      saveWhitelist();
      message.reply(`Removed **${robloxId}**`);
    }
  }

  if (command === 'list') {
    message.reply("Whitelisted IDs: " + Object.keys(whitelist).join(", "));
  }
});

function saveWhitelist() {
  fs.writeFileSync(WHITELIST_FILE, JSON.stringify(whitelist, null, 2));
}

client.login('YOUR_BOT_TOKEN_HERE');
