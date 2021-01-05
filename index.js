const colors = require('colors')
const debug = require('./debug')
const config = require('./config')
const command = require('./command')

const Discord = require('discord.js')
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] })

client.on('ready', () => {
  console.log(colors.green(`Logged in as ${client.user.tag}`))
  client.user.setPresence({game: {name: 'The World Burn', type: "WATCHING"}, status: "online"})
})

client.on('message', msg => {
  command.parse(msg, (cmd, args)=>{
    command.default(cmd, args, msg, client)
  })
})

client.on('messageReactionAdd', async (reaction, user) => {
	// When we receive a reaction we check if the reaction is partial or not
	if (reaction.partial) {
		// If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
		try {
			await reaction.fetch();
		} catch (error) {
			debug.log(`Something went wrong when fetching the message: ${error}`);
			// Return as `reaction.message.author` may be undefined/null
			return;
		}
  }

  // if message is sent by this bot
  if(reaction.message.author.id == client.user.id && user.id != client.user.id) {
    command.db.roleReacts.find({ msg: reaction.message.id }, (err, docs) => {
      if(docs){
        if(docs[0].roles[0].emoji == reaction.emoji.id)
        reaction.message.guild.member(user).roles.add(docs[0].roles[0].role)
        debug.log(`Assinged ${user} to role ${docs[0].roles[0].role}`)
      }
    })
  }
});

client.on('messageReactionRemove', async (reaction, user) => {
	// When we receive a reaction we check if the reaction is partial or not
	if (reaction.partial) {
		// If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
		try {
			await reaction.fetch();
		} catch (error) {
			debug.log(`Something went wrong when fetching the message: ${error}`);
			// Return as `reaction.message.author` may be undefined/null
			return;
		}
  }

  // if message is sent by this bot
  if(reaction.message.author.id == client.user.id && user.id != client.user.id) {
    command.db.roleReacts.find({ msg: reaction.message.id }, (err, docs) => {
      if(docs){
        if(docs[0].roles[0].emoji == reaction.emoji.id)
        reaction.message.guild.member(user).roles.remove(docs[0].roles[0].role)
        debug.log(`Removed ${user} from role ${docs[0].roles[0].role}`)
      }
    })
  }
});

client.login(config.token)