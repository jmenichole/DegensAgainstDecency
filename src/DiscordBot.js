const { Client, GatewayIntentBits, Collection, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

class DiscordBot {
  constructor(gameManager, io) {
    this.gameManager = gameManager;
    this.io = io;
    this.client = null;
    this.commands = new Collection();
    this.isReady = false;
    
    // Initialize bot if token is provided
    if (process.env.DISCORD_BOT_TOKEN) {
      this.initialize();
    } else {
      console.log('⚠️  Discord Bot token not configured - bot functionality disabled');
    }
  }

  initialize() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    });

    this.setupCommands();
    this.setupEventHandlers();
    this.login();
  }

  setupCommands() {
    // Create Game Command
    const createGameCommand = new SlashCommandBuilder()
      .setName('create-game')
      .setDescription('Create a new game')
      .addStringOption(option =>
        option.setName('type')
          .setDescription('Game type')
          .setRequired(true)
          .addChoices(
            { name: 'Degens Against Decency', value: 'degens-against-decency' },
            { name: '2 Truths and a Lie', value: '2-truths-and-a-lie' },
            { name: 'Poker', value: 'poker' }
          )
      )
      .addIntegerOption(option =>
        option.setName('max-players')
          .setDescription('Maximum number of players (3-7)')
          .setMinValue(3)
          .setMaxValue(7)
      )
      .addBooleanOption(option =>
        option.setName('private')
          .setDescription('Make game private (default: false)')
      );

    // List Games Command
    const listGamesCommand = new SlashCommandBuilder()
      .setName('list-games')
      .setDescription('List available public games');

    // Join Game Command
    const joinGameCommand = new SlashCommandBuilder()
      .setName('join-game')
      .setDescription('Join a game by ID')
      .addStringOption(option =>
        option.setName('game-id')
          .setDescription('Game ID to join')
          .setRequired(true)
      );

    // Game Status Command
    const gameStatusCommand = new SlashCommandBuilder()
      .setName('game-status')
      .setDescription('Check your current game status');

    this.commands.set('create-game', {
      data: createGameCommand,
      execute: this.handleCreateGame.bind(this)
    });

    this.commands.set('list-games', {
      data: listGamesCommand,
      execute: this.handleListGames.bind(this)
    });

    this.commands.set('join-game', {
      data: joinGameCommand,
      execute: this.handleJoinGame.bind(this)
    });

    this.commands.set('game-status', {
      data: gameStatusCommand,
      execute: this.handleGameStatus.bind(this)
    });
  }

  setupEventHandlers() {
    this.client.once('ready', () => {
      console.log(`🎮 Discord Bot ready! Logged in as ${this.client.user.tag}`);
      this.isReady = true;
      this.registerSlashCommands();
    });

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const command = this.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error('Error executing command:', error);
        const reply = { content: 'There was an error executing this command!', ephemeral: true };
        
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply);
        } else {
          await interaction.reply(reply);
        }
      }
    });

    this.client.on('error', (error) => {
      console.error('Discord bot error:', error);
    });
  }

  async login() {
    try {
      await this.client.login(process.env.DISCORD_BOT_TOKEN);
    } catch (error) {
      console.error('Failed to login Discord bot:', error);
    }
  }

  async registerSlashCommands() {
    try {
      console.log('Started refreshing application (/) commands.');
      
      const commandsData = Array.from(this.commands.values()).map(cmd => cmd.data.toJSON());
      
      await this.client.application.commands.set(commandsData);
      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error('Error registering slash commands:', error);
    }
  }

  // Command Handlers
  async handleCreateGame(interaction) {
    const gameType = interaction.options.getString('type');
    const maxPlayers = interaction.options.getInteger('max-players') || 7;
    const isPrivate = interaction.options.getBoolean('private') || false;

    // Create Discord user object
    const discordUser = {
      id: interaction.user.id,
      username: interaction.user.username,
      discriminator: interaction.user.discriminator || '0000',
      avatar: interaction.user.avatar,
      isDiscordBot: true
    };

    try {
      const game = this.gameManager.createGame(gameType, discordUser, isPrivate, maxPlayers);
      
      const embed = new EmbedBuilder()
        .setColor(0x00AE86)
        .setTitle('🎮 Game Created!')
        .setDescription(`Your ${this.formatGameType(gameType)} game has been created!`)
        .addFields(
          { name: 'Game ID', value: game.id, inline: true },
          { name: 'Max Players', value: maxPlayers.toString(), inline: true },
          { name: 'Private', value: isPrivate ? 'Yes' : 'No', inline: true },
          { name: 'Web Interface', value: `${process.env.DOMAIN || 'http://localhost:3000'}/game/${game.id}` }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      // Notify web users in lobby
      this.io.to('lobby').emit('lobby-games', this.gameManager.getPublicGames());
      
    } catch (error) {
      await interaction.reply({ 
        content: `❌ Failed to create game: ${error.message}`, 
        ephemeral: true 
      });
    }
  }

  async handleListGames(interaction) {
    const publicGames = this.gameManager.getPublicGames();
    
    if (publicGames.length === 0) {
      await interaction.reply({ 
        content: '📭 No public games available. Create one with `/create-game`!',
        ephemeral: true
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('🎮 Available Public Games')
      .setTimestamp();

    publicGames.forEach((game, index) => {
      if (index < 10) { // Limit to 10 games to avoid embed limits
        embed.addFields({
          name: `${this.formatGameType(game.type)}`,
          value: `**ID:** ${game.id}\n**Players:** ${game.currentPlayers}/${game.maxPlayers}\n**Status:** ${this.formatStatus(game.status)}\n**Creator:** ${game.creator}`,
          inline: true
        });
      }
    });

    if (publicGames.length > 10) {
      embed.setFooter({ text: `Showing first 10 of ${publicGames.length} games` });
    }

    await interaction.reply({ embeds: [embed] });
  }

  async handleJoinGame(interaction) {
    const gameId = interaction.options.getString('game-id');
    
    // Create Discord user object  
    const discordUser = {
      id: interaction.user.id,
      username: interaction.user.username,
      discriminator: interaction.user.discriminator || '0000',
      avatar: interaction.user.avatar,
      isDiscordBot: true
    };

    const game = this.gameManager.getGame(gameId);
    if (!game) {
      await interaction.reply({ 
        content: '❌ Game not found! Use `/list-games` to see available games.',
        ephemeral: true 
      });
      return;
    }

    const result = game.addPlayer(discordUser.id, null); // No socket for Discord users
    
    if (result.success) {
      const embed = new EmbedBuilder()
        .setColor(0x00AE86)
        .setTitle('✅ Joined Game!')
        .setDescription(`You've joined the ${this.formatGameType(game.type)} game!`)
        .addFields(
          { name: 'Game ID', value: gameId, inline: true },
          { name: 'Players', value: `${game.players.length}/${game.maxPlayers}`, inline: true },
          { name: 'Status', value: this.formatStatus(game.status), inline: true },
          { name: 'Web Interface', value: `${process.env.DOMAIN || 'http://localhost:3000'}/game/${gameId}` }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      // Notify web users in the game
      this.io.to(gameId).emit('game-update', game.getGameState());
      this.io.to('lobby').emit('lobby-games', this.gameManager.getPublicGames());
    } else {
      await interaction.reply({ 
        content: `❌ Failed to join game: ${result.error}`,
        ephemeral: true 
      });
    }
  }

  async handleGameStatus(interaction) {
    const userId = interaction.user.id;
    const userGames = [];
    
    // Find games where user is a player
    for (const [gameId, game] of this.gameManager.games) {
      if (game.players.some(player => player.id === userId)) {
        userGames.push({ id: gameId, game });
      }
    }

    if (userGames.length === 0) {
      await interaction.reply({ 
        content: '📭 You are not in any active games. Use `/create-game` or `/join-game` to start playing!',
        ephemeral: true 
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('🎮 Your Game Status')
      .setTimestamp();

    userGames.forEach(({ id, game }) => {
      embed.addFields({
        name: this.formatGameType(game.type),
        value: `**ID:** ${id}\n**Players:** ${game.players.length}/${game.maxPlayers}\n**Status:** ${this.formatStatus(game.status)}\n**Round:** ${game.currentRound || 0}`,
        inline: true
      });
    });

    await interaction.reply({ embeds: [embed] });
  }

  // Notification methods for game events
  async notifyGameStart(gameId, game) {
    if (!this.isReady) return;

    const embed = new EmbedBuilder()
      .setColor(0x00AE86)
      .setTitle('🚀 Game Started!')
      .setDescription(`${this.formatGameType(game.type)} game has begun!`)
      .addFields(
        { name: 'Game ID', value: gameId, inline: true },
        { name: 'Players', value: game.players.length.toString(), inline: true }
      )
      .setTimestamp();

    // Send notification to Discord users in the game
    for (const player of game.players) {
      if (player.isDiscordBot) {
        try {
          const user = await this.client.users.fetch(player.id);
          await user.send({ embeds: [embed] });
        } catch (error) {
          console.error(`Failed to notify Discord user ${player.id}:`, error);
        }
      }
    }
  }

  async notifyGameEnd(gameId, game, winner) {
    if (!this.isReady) return;

    const embed = new EmbedBuilder()
      .setColor(0xFF6B6B)
      .setTitle('🏆 Game Finished!')
      .setDescription(`${this.formatGameType(game.type)} game has ended!`)
      .addFields(
        { name: 'Game ID', value: gameId, inline: true },
        { name: 'Winner', value: winner ? winner.username : 'No winner', inline: true }
      )
      .setTimestamp();

    // Send notification to Discord users in the game
    for (const player of game.players) {
      if (player.isDiscordBot) {
        try {
          const user = await this.client.users.fetch(player.id);
          await user.send({ embeds: [embed] });
        } catch (error) {
          console.error(`Failed to notify Discord user ${player.id}:`, error);
        }
      }
    }
  }

  // Utility methods
  formatGameType(type) {
    const types = {
      'degens-against-decency': 'Degens Against Decency',
      '2-truths-and-a-lie': '2 Truths and a Lie',
      'poker': 'Poker'
    };
    return types[type] || type;
  }

  formatStatus(status) {
    const statuses = {
      'waiting': '⏳ Waiting for players',
      'playing': '🎮 In progress',
      'finished': '✅ Finished'
    };
    return statuses[status] || status;
  }

  // Clean shutdown
  destroy() {
    if (this.client) {
      this.client.destroy();
    }
  }
}

module.exports = DiscordBot;