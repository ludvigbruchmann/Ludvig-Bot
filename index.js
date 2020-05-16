const colors = require('colors')
const config = require('./config')
const command = require('./command')

const Discord = require('discord.js')
const client = new Discord.Client()

client.on('ready', () => {
  console.log(colors.green(`Logged in as ${client.user.tag}`))
  client.user.setPresence({game: {name: 'The World Burn', type: "WATCHING"}, status: "online"})
  command.setup(client)
})

client.on('message', msg => {
  command.parse(msg, (cmd, args)=>{
    command.default(cmd, args, msg, client)
  })
})

client.login(config.token)