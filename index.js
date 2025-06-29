require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

const totalRFT = 2800;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// Register slash command
const commands = [
  new SlashCommandBuilder()
    .setName('rmd')
    .setDescription('Fetches RFT data from RMD (RFT MANUAL DATABASE).'),
	new SlashCommandBuilder()
	  .setName('transfer-rft')
		.setDescription("Transfers RFT")
		.addNumberOption(option => 
			option.setName('amount')
			  .setDescription("Amount of RFT")
				.setRequired(true)
		)
		.addUserOption(option =>
			option.setName('reciever')
			  .setDescription("Reciever")
				.setRequired(true)
		)
	
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('🔁 Registering commands...');
    await rest.put(
      Routes.applicationCommands('1388493991439499275'),
      { body: commands },
    );
    console.log('✅ Commands registered!');
  } catch (err) {
    console.error('Command registration failed:', err);
  }
})();

// Handle /rftshow command
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'rmd') {
    try {
      const res = await axios.get(`https://api.jsonbin.io/v3/b/${process.env.JSONBIN_ID}/latest`, {
        headers: {
          'X-Master-Key': process.env.JSONBIN_API_KEY
        }
      });

      const data = res.data.record;
      let response = '📊 **RFT Balances**:\n';
      data.forEach((user) => {
        response += `**${user.name}**: ${user.balance} RFT (₱${(user.balance * 0.2).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})\n`;
      });
			const total = data.reduce((sum, d) => sum + d.balance, 0);
      response += `**Total**: ${total.toFixed(2)} / ${totalRFT} RFT`;
			await interaction.reply(response);
    } catch (err) {
      console.error('Fetch error:', err.message);
      await interaction.reply('❌ Could not fetch RFT data from JSONBin.');
    }
  } else if (interaction.commandName === 'transfer-rft') {
		try {
			await interaction.reply("Coming Soon maybe.");
		} catch (err) {
      console.error('Fetch error:', err.message);
      await interaction.reply('❌ Could not fetch RFT data from JSONBin.');
    } 
	}
});

client.login(process.env.DISCORD_TOKEN);