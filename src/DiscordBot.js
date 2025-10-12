/**
 * Discord Bot - Discord integration for game management
 * 
 * Copyright (c) 2024 Degens Against Decency
 * Licensed under the MIT License
 * See LICENSE file in the project root for full license information.
 */

const { Client, GatewayIntentBits, Collection, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

class DiscordBot {
  constructor(gameManager, io) {
    this.gameManager = gameManager;
    this.io = io;
    this.client = null;
    this.commands = new Collection();
    this.discordGames = new Map(); // Store Discord-native games
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
      .addStringOption(option =>
        option.setName('platform')
          .setDescription('Where to play the game')
          .setRequired(true)
          .addChoices(
            { name: '🎮 Play in Discord Server', value: 'discord' },
            { name: '🌐 Play in Web Arena', value: 'web' }
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

    // Join Discord Game Command
    const joinDiscordGameCommand = new SlashCommandBuilder()
      .setName('join-discord-game')
      .setDescription('Join a Discord-based game by ID')
      .addStringOption(option =>
        option.setName('game-id')
          .setDescription('Discord game ID to join')
          .setRequired(true)
      );

    // Start Discord Game Command
    const startDiscordGameCommand = new SlashCommandBuilder()
      .setName('start-discord-game')
      .setDescription('Start a Discord-based game')
      .addStringOption(option =>
        option.setName('game-id')
          .setDescription('Discord game ID to start')
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

    this.commands.set('start-discord-game', {
      data: startDiscordGameCommand,
      execute: this.handleStartDiscordGame.bind(this)
    });

    this.commands.set('join-discord-game', {
      data: joinDiscordGameCommand,
      execute: this.handleJoinDiscordGame.bind(this)
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

    // Handle reactions for joining Discord games
    this.client.on('messageReactionAdd', async (reaction, user) => {
      if (user.bot) return;
      
      if (reaction.emoji.name === '🎮') {
        await this.handleGameJoinReaction(reaction, user);
      }
    });

    // Handle messages for Discord game interactions
    this.client.on('messageCreate', async (message) => {
      if (message.author.bot) return;
      await this.handleDiscordGameMessage(message);
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
    const platform = interaction.options.getString('platform');
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
      if (platform === 'discord') {
        // Create Discord-native game
        return await this.createDiscordGame(interaction, gameType, discordUser, maxPlayers, isPrivate);
      } else {
        // Create web-based game (existing functionality)
        return await this.createWebGame(interaction, gameType, discordUser, maxPlayers, isPrivate);
      }
    } catch (error) {
      await interaction.reply({ 
        content: `❌ Failed to create game: ${error.message}`, 
        ephemeral: true 
      });
    }
  }

  async createWebGame(interaction, gameType, discordUser, maxPlayers, isPrivate) {
    const game = this.gameManager.createGame(gameType, discordUser, isPrivate, maxPlayers);
    
    const embed = new EmbedBuilder()
      .setColor(0x00AE86)
      .setTitle('🌐 Web Game Created!')
      .setDescription(`Your ${this.formatGameType(gameType)} game has been created in the web arena!`)
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
  }

  async createDiscordGame(interaction, gameType, discordUser, maxPlayers, isPrivate) {
    // Create a Discord-native game session
    const gameId = require('uuid').v4().substring(0, 8); // Shorter ID for Discord
    
    // Store Discord game session
    if (!this.discordGames) {
      this.discordGames = new Map();
    }

    const discordGame = {
      id: gameId,
      type: gameType,
      creator: discordUser,
      players: [discordUser],
      maxPlayers,
      isPrivate,
      channelId: interaction.channelId,
      guildId: interaction.guildId,
      status: 'waiting',
      createdAt: new Date()
    };

    this.discordGames.set(gameId, discordGame);

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('🎮 Discord Game Created!')
      .setDescription(`${this.formatGameType(gameType)} game is ready to play in this Discord server!`)
      .addFields(
        { name: 'Game ID', value: gameId, inline: true },
        { name: 'Players', value: `1/${maxPlayers}`, inline: true },
        { name: 'Status', value: '⏳ Waiting for players', inline: true }
      )
      .setFooter({ text: 'Other players can join with /join-discord-game' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    // Send follow-up instructions
    const instructionsEmbed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle('🎯 How to Join')
      .setDescription('Players can join this Discord game using:')
      .addFields(
        { name: 'Command', value: `/join-discord-game ${gameId}`, inline: false },
        { name: 'Or React', value: 'React with 🎮 to join!', inline: false }
      );

    const followUp = await interaction.followUp({ embeds: [instructionsEmbed] });
    
    // Add reaction for easy joining
    try {
      await followUp.react('🎮');
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }

    // Store message ID for reaction handling
    discordGame.joinMessageId = followUp.id;
  }

  async handleListGames(interaction) {
    const publicGames = this.gameManager.getPublicGames();
    const discordGames = this.discordGames ? Array.from(this.discordGames.values()).filter(g => !g.isPrivate && g.status !== 'finished') : [];
    
    if (publicGames.length === 0 && discordGames.length === 0) {
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

    // Add web games
    if (publicGames.length > 0) {
      embed.addFields({
        name: '🌐 Web Arena Games',
        value: publicGames.slice(0, 5).map(game => 
          `**${this.formatGameType(game.type)}**\nID: ${game.id}\nPlayers: ${game.currentPlayers}/${game.maxPlayers}\nStatus: ${this.formatStatus(game.status)}\nCreator: ${game.creator}`
        ).join('\n\n'),
        inline: false
      });
    }

    // Add Discord games
    if (discordGames.length > 0) {
      embed.addFields({
        name: '🎮 Discord Server Games',
        value: discordGames.slice(0, 5).map(game => 
          `**${this.formatGameType(game.type)}**\nID: ${game.id}\nPlayers: ${game.players.length}/${game.maxPlayers}\nStatus: ${this.formatStatus(game.status)}\nCreator: ${game.creator.username}`
        ).join('\n\n'),
        inline: false
      });
    }

    const totalGames = publicGames.length + discordGames.length;
    if (totalGames > 10) {
      embed.setFooter({ text: `Showing first 10 of ${totalGames} games` });
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

  async handleJoinDiscordGame(interaction) {
    const gameId = interaction.options.getString('game-id');
    
    if (!this.discordGames || !this.discordGames.has(gameId)) {
      await interaction.reply({ 
        content: '❌ Discord game not found! Use `/list-games` to see available games.',
        ephemeral: true 
      });
      return;
    }

    const game = this.discordGames.get(gameId);
    const userId = interaction.user.id;

    // Check if user is already in the game
    if (game.players.some(p => p.id === userId)) {
      await interaction.reply({ 
        content: '⚠️ You are already in this game!',
        ephemeral: true 
      });
      return;
    }

    // Check if game is full
    if (game.players.length >= game.maxPlayers) {
      await interaction.reply({ 
        content: '❌ This game is full!',
        ephemeral: true 
      });
      return;
    }

    // Check if game has started
    if (game.status !== 'waiting') {
      await interaction.reply({ 
        content: '❌ This game has already started!',
        ephemeral: true 
      });
      return;
    }

    // Add player to Discord game
    const discordUser = {
      id: interaction.user.id,
      username: interaction.user.username,
      discriminator: interaction.user.discriminator || '0000',
      avatar: interaction.user.avatar,
      isDiscordBot: true
    };

    game.players.push(discordUser);

    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle('✅ Joined Discord Game!')
      .setDescription(`You've joined the ${this.formatGameType(game.type)} game!`)
      .addFields(
        { name: 'Game ID', value: gameId, inline: true },
        { name: 'Players', value: `${game.players.length}/${game.maxPlayers}`, inline: true },
        { name: 'Status', value: this.formatStatus(game.status), inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    // Update the original game message if possible
    try {
      const channel = await this.client.channels.fetch(game.channelId);
      if (channel && game.joinMessageId) {
        const message = await channel.messages.fetch(game.joinMessageId);
        const updatedEmbed = new EmbedBuilder()
          .setColor(0x57F287)
          .setTitle('🎯 How to Join')
          .setDescription('Players can join this Discord game using:')
          .addFields(
            { name: 'Command', value: `/join-discord-game ${gameId}`, inline: false },
            { name: 'Current Players', value: `${game.players.length}/${game.maxPlayers}`, inline: false },
            { name: 'Players', value: game.players.map(p => `• ${p.username}`).join('\n'), inline: false }
          );

        await message.edit({ embeds: [updatedEmbed] });
      }
    } catch (error) {
      console.error('Failed to update join message:', error);
    }

    // Check if game is ready to start
    if (game.players.length >= 3) { // Minimum players
      const startEmbed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle('🚀 Ready to Start!')
        .setDescription(`The game has enough players to begin! Creator <@${game.creator.id}> can start the game.`)
        .addFields(
          { name: 'Start Command', value: `/start-discord-game ${gameId}`, inline: false }
        );

      const channel = await this.client.channels.fetch(game.channelId);
      await channel.send({ embeds: [startEmbed] });
    }
  }

  async handleStartDiscordGame(interaction) {
    const gameId = interaction.options.getString('game-id');
    
    if (!this.discordGames || !this.discordGames.has(gameId)) {
      await interaction.reply({ 
        content: '❌ Discord game not found!',
        ephemeral: true 
      });
      return;
    }

    const game = this.discordGames.get(gameId);

    // Check if user is the creator
    if (game.creator.id !== interaction.user.id) {
      await interaction.reply({ 
        content: '❌ Only the game creator can start the game!',
        ephemeral: true 
      });
      return;
    }

    // Check if enough players
    if (game.players.length < 3) {
      await interaction.reply({ 
        content: '❌ Need at least 3 players to start the game!',
        ephemeral: true 
      });
      return;
    }

    // Check if game already started
    if (game.status !== 'waiting') {
      await interaction.reply({ 
        content: '⚠️ Game has already started!',
        ephemeral: true 
      });
      return;
    }

    // Start the game
    game.status = 'playing';
    game.currentRound = 1;

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('🚀 Game Started!')
      .setDescription(`${this.formatGameType(game.type)} is now beginning!`)
      .addFields(
        { name: 'Players', value: game.players.map(p => `• ${p.username}`).join('\n'), inline: false },
        { name: 'Game Mode', value: 'Discord Server', inline: true },
        { name: 'Round', value: '1', inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    // Start game-specific logic
    switch (game.type) {
      case '2-truths-and-a-lie':
        await this.start2TruthsDiscordGame(game);
        break;
      case 'degens-against-decency':
        await this.startDegensDiscordGame(game);
        break;
      case 'poker':
        await this.startPokerDiscordGame(game);
        break;
    }
  }

  async start2TruthsDiscordGame(game) {
    const channel = await this.client.channels.fetch(game.channelId);
    
    // Initialize game state
    game.currentPlayerIndex = 0;
    game.scores = new Map(game.players.map(p => [p.id, 0]));
    game.maxRounds = game.players.length * 2; // 2 rounds per player
    game.currentRound = 1;

    const currentPlayer = game.players[game.currentPlayerIndex];
    
    const gameEmbed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('🎭 2 Truths and a Lie - Round 1')
      .setDescription(`**${currentPlayer.username}**'s turn!`)
      .addFields(
        { 
          name: '📝 Your Task', 
          value: 'Please provide 3 statements about yourself:\n• 2 should be TRUE\n• 1 should be a LIE\n\nType them in chat, numbered 1, 2, 3', 
          inline: false 
        },
        { name: '⏰ Time Limit', value: '2 minutes', inline: true },
        { name: '👥 Other Players', value: 'Get ready to guess which one is the lie!', inline: true }
      )
      .setFooter({ text: `Round ${game.currentRound} of ${game.maxRounds}` });

    await channel.send({ embeds: [gameEmbed] });
    await channel.send(`<@${currentPlayer.id}>, it's your turn! Please share your 3 statements.`);

    // Store game state for message handling
    game.waitingFor = 'statements';
    game.statementTimeout = setTimeout(() => {
      this.handleDiscordGameTimeout(game);
    }, 120000); // 2 minute timeout
  }

  async startDegensDiscordGame(game) {
    const channel = await this.client.channels.fetch(game.channelId);
    
    const embed = new EmbedBuilder()
      .setColor(0xFF6B6B)
      .setTitle('🔥 Degens Against Decency')
      .setDescription('This game works best in the web interface due to card management complexity.')
      .addFields(
        { name: '🌐 Play in Web Arena', value: `For the full experience, please use:\n${process.env.DOMAIN || 'http://localhost:3000'}/game/create`, inline: false },
        { name: '🎮 Discord Alternative', value: 'We recommend "2 Truths and a Lie" for Discord play!', inline: false }
      );

    await channel.send({ embeds: [embed] });
  }

  async startPokerDiscordGame(game) {
    const channel = await this.client.channels.fetch(game.channelId);
    
    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle('♠️ Poker Game')
      .setDescription('Poker requires complex hand management and is best played in the web interface.')
      .addFields(
        { name: '🌐 Play in Web Arena', value: `For the full poker experience:\n${process.env.DOMAIN || 'http://localhost:3000'}/game/create`, inline: false },
        { name: '🎮 Discord Alternative', value: 'Try "2 Truths and a Lie" for native Discord gameplay!', inline: false }
      );

    await channel.send({ embeds: [embed] });
  }

  async handleDiscordGameTimeout(game) {
    const channel = await this.client.channels.fetch(game.channelId);
    
    const embed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('⏰ Game Timeout')
      .setDescription('The current player took too long to respond. Moving to next player...');

    await channel.send({ embeds: [embed] });
    
    // Move to next player or end game
    this.nextDiscordGameTurn(game);
  }

  async nextDiscordGameTurn(game) {
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
    game.currentRound++;

    if (game.currentRound > game.maxRounds) {
      return this.endDiscordGame(game);
    }

    // Continue game based on type
    if (game.type === '2-truths-and-a-lie') {
      await this.start2TruthsDiscordGame(game);
    }
  }

  async endDiscordGame(game) {
    const channel = await this.client.channels.fetch(game.channelId);
    
    // Calculate final scores
    const sortedScores = Array.from(game.scores.entries())
      .sort(([,a], [,b]) => b - a);

    const winner = game.players.find(p => p.id === sortedScores[0][0]);
    
    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle('🏆 Game Complete!')
      .setDescription(`Congratulations ${winner.username}!`)
      .addFields(
        { 
          name: '📊 Final Scores', 
          value: sortedScores.map(([playerId, score], index) => {
            const player = game.players.find(p => p.id === playerId);
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤';
            return `${medal} ${player.username}: ${score} points`;
          }).join('\n'),
          inline: false 
        }
      )
      .setTimestamp();

    await channel.send({ embeds: [embed] });
    
    // Clean up
    game.status = 'finished';
    setTimeout(() => {
      this.discordGames.delete(game.id);
    }, 300000); // Clean up after 5 minutes
  }

  async handleDiscordGameMessage(message) {
    if (!this.discordGames) return;

    // Find active games in this channel
    const channelGames = Array.from(this.discordGames.values())
      .filter(game => game.channelId === message.channelId && game.status === 'playing');

    if (channelGames.length === 0) return;

    const game = channelGames[0]; // Handle first active game in channel
    const userId = message.author.id;

    // Handle game-specific interactions
    if (game.type === '2-truths-and-a-lie') {
      await this.handle2TruthsMessage(game, message, userId);
    }
  }

  async handle2TruthsMessage(game, message, userId) {
    const currentPlayer = game.players[game.currentPlayerIndex];

    if (game.waitingFor === 'statements' && userId === currentPlayer.id) {
      // Parse statements from message
      const content = message.content.trim();
      const lines = content.split('\n').filter(line => line.trim());
      
      // Look for numbered statements
      const statements = [];
      for (let i = 1; i <= 3; i++) {
        const statement = lines.find(line => line.trim().startsWith(`${i}.`) || line.trim().startsWith(`${i}:`));
        if (statement) {
          statements.push(statement.replace(/^\d+[.:]?\s*/, '').trim());
        }
      }

      if (statements.length !== 3) {
        const helpEmbed = new EmbedBuilder()
          .setColor(0xFFAA00)
          .setTitle('❓ Invalid Format')
          .setDescription('Please provide exactly 3 numbered statements:\n\n1. First statement\n2. Second statement\n3. Third statement');
        
        await message.reply({ embeds: [helpEmbed] });
        return;
      }

      // Clear timeout
      if (game.statementTimeout) {
        clearTimeout(game.statementTimeout);
        delete game.statementTimeout;
      }

      // Store statements and start voting
      game.currentStatements = statements;
      game.waitingFor = 'votes';
      game.votes = new Map();

      const voteEmbed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🗳️ Time to Vote!')
        .setDescription(`**${currentPlayer.username}** has shared their statements:`)
        .addFields(
          { name: '1️⃣ Statement 1', value: statements[0], inline: false },
          { name: '2️⃣ Statement 2', value: statements[1], inline: false },
          { name: '3️⃣ Statement 3', value: statements[2], inline: false },
          { name: '🎯 Vote Instructions', value: 'React with 1️⃣, 2️⃣, or 3️⃣ to vote for which statement is the LIE!', inline: false }
        )
        .setFooter({ text: 'All other players must vote! 60 seconds remaining.' });

      const votingMessage = await message.channel.send({ embeds: [voteEmbed] });
      
      // Add voting reactions
      await votingMessage.react('1️⃣');
      await votingMessage.react('2️⃣');
      await votingMessage.react('3️⃣');

      game.votingMessageId = votingMessage.id;

      // Set voting timeout
      game.voteTimeout = setTimeout(() => {
        this.handleVotingTimeout(game);
      }, 60000); // 1 minute for voting

    } else if (game.waitingFor === 'reveal' && userId === currentPlayer.id) {
      // Handle reveal
      const content = message.content.trim();
      const lieNumber = parseInt(content);

      if (lieNumber >= 1 && lieNumber <= 3) {
        // Clear timeout
        if (game.revealTimeout) {
          clearTimeout(game.revealTimeout);
          delete game.revealTimeout;
        }

        // Calculate scores
        let correctGuesses = 0;
        const voteResults = [];

        for (const [voterId, vote] of game.votes) {
          const voter = game.players.find(p => p.id === voterId);
          const isCorrect = vote === lieNumber;
          if (isCorrect) {
            correctGuesses++;
            const currentScore = game.scores.get(voterId) || 0;
            game.scores.set(voterId, currentScore + 1);
          }
          voteResults.push(`${voter.username}: ${vote === lieNumber ? '✅' : '❌'} (voted ${vote})`);
        }

        // Award points to current player if they fooled people
        const fooledCount = game.votes.size - correctGuesses;
        if (fooledCount > 0) {
          const currentScore = game.scores.get(currentPlayer.id) || 0;
          game.scores.set(currentPlayer.id, currentScore + fooledCount);
        }

        const resultsEmbed = new EmbedBuilder()
          .setColor(0x00FF00)
          .setTitle('🎉 Results!')
          .setDescription(`The lie was: **"${game.currentStatements[lieNumber - 1]}"**`)
          .addFields(
            { name: '📊 Voting Results', value: voteResults.join('\n') || 'No votes cast', inline: false },
            { name: '🏆 Points Awarded', value: `${currentPlayer.username}: +${fooledCount} (fooled ${fooledCount} players)\nCorrect guessers: +1 each`, inline: false }
          );

        await message.channel.send({ embeds: [resultsEmbed] });

        // Move to next turn
        setTimeout(() => {
          this.nextDiscordGameTurn(game);
        }, 3000);
      } else {
        const helpEmbed = new EmbedBuilder()
          .setColor(0xFFAA00)
          .setTitle('❓ Invalid Response')
          .setDescription('Please reply with "1", "2", or "3" to indicate which statement was the lie.');
        
        await message.reply({ embeds: [helpEmbed] });
      }
    }
  }

  async handleVotingTimeout(game) {
    const channel = await this.client.channels.fetch(game.channelId);
    
    const embed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('⏰ Voting Timeout')
      .setDescription('Voting time has ended! Proceeding with current votes...');

    await channel.send({ embeds: [embed] });
    await this.processVotingResults(game);
  }

  async processVotingResults(game) {
    const channel = await this.client.channels.fetch(game.channelId);
    
    // Get voting message and process reactions
    if (game.votingMessageId) {
      try {
        const votingMessage = await channel.messages.fetch(game.votingMessageId);
        const reactions = ['1️⃣', '2️⃣', '3️⃣'];
        
        for (let i = 0; i < reactions.length; i++) {
          const reaction = votingMessage.reactions.cache.get(reactions[i]);
          if (reaction) {
            const users = await reaction.users.fetch();
            users.forEach(user => {
              if (!user.bot && user.id !== game.players[game.currentPlayerIndex].id) {
                game.votes.set(user.id, i + 1);
              }
            });
          }
        }
      } catch (error) {
        console.error('Error processing votes:', error);
      }
    }

    // For demo purposes, ask current player to reveal which was the lie
    const currentPlayer = game.players[game.currentPlayerIndex];
    
    const revealEmbed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle('🎭 Time to Reveal!')
      .setDescription(`<@${currentPlayer.id}>, which statement was the **LIE**?`)
      .addFields(
        { name: 'Reply with:', value: 'Type "1", "2", or "3" to reveal which statement was false!', inline: false },
        { name: 'Votes received:', value: `${game.votes.size} players voted`, inline: true }
      );

    await channel.send({ embeds: [revealEmbed] });
    
    game.waitingFor = 'reveal';
    game.revealTimeout = setTimeout(() => {
      this.handleRevealTimeout(game);
    }, 60000);
  }

  async handleRevealTimeout(game) {
    const channel = await this.client.channels.fetch(game.channelId);
    
    const embed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('⏰ Reveal Timeout')
      .setDescription('Moving to next turn...');

    await channel.send({ embeds: [embed] });
    await this.nextDiscordGameTurn(game);
  }

  async handleGameJoinReaction(reaction, user) {
    if (!this.discordGames) return;

    // Find the game associated with this message
    let targetGame = null;
    let targetGameId = null;

    for (const [gameId, game] of this.discordGames) {
      if (game.joinMessageId === reaction.message.id) {
        targetGame = game;
        targetGameId = gameId;
        break;
      }
    }

    if (!targetGame) return;

    // Check if user is already in the game
    if (targetGame.players.some(p => p.id === user.id)) {
      return; // Silently ignore if already in game
    }

    // Check if game is full or started
    if (targetGame.players.length >= targetGame.maxPlayers || targetGame.status !== 'waiting') {
      return;
    }

    // Add player to game
    const discordUser = {
      id: user.id,
      username: user.username,
      discriminator: user.discriminator || '0000',
      avatar: user.avatar,
      isDiscordBot: true
    };

    targetGame.players.push(discordUser);

    // Send confirmation DM to user
    try {
      const dmEmbed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle('✅ Joined Discord Game!')
        .setDescription(`You've joined the ${this.formatGameType(targetGame.type)} game via reaction!`)
        .addFields(
          { name: 'Game ID', value: targetGameId, inline: true },
          { name: 'Players', value: `${targetGame.players.length}/${targetGame.maxPlayers}`, inline: true }
        );

      await user.send({ embeds: [dmEmbed] });
    } catch (error) {
      console.error('Failed to send DM:', error);
    }

    // Update the join message
    try {
      const updatedEmbed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle('🎯 How to Join')
        .setDescription('Players can join this Discord game using:')
        .addFields(
          { name: 'Command', value: `/join-discord-game ${targetGameId}`, inline: false },
          { name: 'Current Players', value: `${targetGame.players.length}/${targetGame.maxPlayers}`, inline: false },
          { name: 'Players', value: targetGame.players.map(p => `• ${p.username}`).join('\n'), inline: false }
        );

      await reaction.message.edit({ embeds: [updatedEmbed] });
    } catch (error) {
      console.error('Failed to update join message:', error);
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

    // Also check Discord games
    const discordUserGames = [];
    if (this.discordGames) {
      for (const [gameId, game] of this.discordGames) {
        if (game.players.some(player => player.id === userId)) {
          discordUserGames.push({ id: gameId, game, isDiscord: true });
        }
      }
    }

    if (userGames.length === 0 && discordUserGames.length === 0) {
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

    // Add web games
    userGames.forEach(({ id, game }) => {
      embed.addFields({
        name: `🌐 ${this.formatGameType(game.type)}`,
        value: `**ID:** ${id}\n**Players:** ${game.players.length}/${game.maxPlayers}\n**Status:** ${this.formatStatus(game.status)}\n**Round:** ${game.currentRound || 0}`,
        inline: true
      });
    });

    // Add Discord games
    discordUserGames.forEach(({ id, game }) => {
      embed.addFields({
        name: `🎮 ${this.formatGameType(game.type)}`,
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