const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const WHITELIST_FILE = './whitelist.json';
let whitelist = {};

// Load whitelist safely
if (fs.existsSync(WHITELIST_FILE)) {
  try {
    const data = fs.readFileSync(WHITELIST_FILE, 'utf-8').trim();
    if (data) {
      whitelist = JSON.parse(data);
      console.log(`Loaded ${Object.keys(whitelist).length} whitelisted users`);
    } else {
      console.log('whitelist.json is empty → starting with empty object');
    }
  } catch (err) {
    console.error('Failed to parse whitelist.json:', err.message);
    console.log('Starting with empty whitelist');
  }
} else {
  console.log('whitelist.json not found → creating empty one on first save');
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag} | Ready!`);
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith('!wl') || message.author.bot) return;

  const args = message.content.slice(3).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  if (!command) return;

  if (command === 'add') {
    if (!message.member?.permissions.has('Administrator')) {
      return message.reply("You don't have Administrator permission.");
    }

    const user = message.mentions.users.first();
    if (!user) return message.reply("Please mention a Discord user.");

    const robloxId = args[1];
    if (!robloxId || isNaN(robloxId)) {
      return message.reply("Usage: !wl add @user 123456789\n(Provide a valid Roblox User ID)");
    }

    whitelist[robloxId] = {
      discord: user.id,
      added: Date.now(),
      addedBy: message.author.id
    };

    saveWhitelist();
    message.reply(`✅ Whitelisted Roblox ID **${robloxId}** for <@${user.id}>`);
  }

  else if (command === 'remove') {
    if (!message.member?.permissions.has('Administrator')) {
      return message.reply("You don't have Administrator permission.");
    }

    const robloxId = args[0];
    if (!robloxId) {
      return message.reply("Usage: !wl remove 123456789");
    }

    if (whitelist[robloxId]) {
      delete whitelist[robloxId];
      saveWhitelist();
      message.reply(`🗑️ Removed Roblox ID **${robloxId}** from whitelist`);
    } else {
      message.reply(`ID **${robloxId}** was not found in the whitelist`);
    }
  }

  else if (command === 'list') {
    if (Object.keys(whitelist).length === 0) {
      return message.reply("The whitelist is currently empty.");
    }

    const list = Object.entries(whitelist)
      .map(([id, info]) => `**${id}** → <@${info.discord}> (added ${new Date(info.added).toLocaleDateString()})`)
      .join('\n');

    message.reply(`Whitelisted Roblox IDs:\n${list}`);
  }

  // Optional: help command
  else if (command === 'help') {
    message.reply(
      '`!wl add @user 123456789` → Add user to whitelist\n' +
      '`!wl remove 123456789` → Remove user\n' +
      '`!wl list` → Show all whitelisted IDs\n' +
      '`!wl help` → This message'
    );
  }
});

function saveWhitelist() {
  try {
    fs.writeFileSync(WHITELIST_FILE, JSON.stringify(whitelist, null, 2), 'utf-8');
    console.log('Whitelist saved successfully');
  } catch (err) {
    console.error('Failed to save whitelist.json:', err.message);
  }
}

client.login('');
