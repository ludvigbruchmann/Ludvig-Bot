const colors = require('colors')
const debug = require('./debug')
const config = require('./config')
const funnies = require('./funnies')
const md = require('./md')

const package = require('./package.json');

const Datastore = require('nedb')
var db = {
  simples: new Datastore({filename: 'data/simples.json', autoload: true})
}

function parseSimple(simple, args){
  output = simple
    .replace(/(?!\\)\$v/g, package.version)
    .replace(/(?!\\)\$version/g, package.version)
  return output;
}

module.exports = {
  parse: (msg, callback=(cmd,args)=>{}) => {
    if(msg.content.startsWith(config.prefix)){
      msgArray = msg.content.match(/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g)
      for (let i = 0; i < msgArray.length; i++) {
        msgArray[i] = msgArray[i].replace(/^"(.+(?="$))"$/, '$1')
        
      }
      cmd = msgArray[0].substr(1)
      args = msgArray.slice(1)
      debug.log(`${colors.blue("@" + msg.author.username) + " in " + colors.blue("#" + msg.channel.name)} > ${colors.green(config.prefix + cmd)} > ${args.join(", ")}`)
      callback(cmd, args)
    }
  },
  default: (cmd, args, msg=null, client=null) => {

    switch (cmd) {

      case "kill":
        if(config.gods.includes(msg.author.id)){
          msg.channel.send(`:skull:`)
            .then(console.log(colors.red("God Force Shotdown")))
            .then(client.destroy())
        } else {
          msg.reply(funnies.kill())
        }
        break

      case "status":
        if(config.gods.includes(msg.author.id) && args.length >= 2){
          client.user.setPresence({game: {name: args[1], type: args[0].toUpperCase()}, status: "online"})
          debug.log("Changed status: " + colors.blue(`${args[0]} ${args[1]}`))
          msg.channel.send("Changed status: " + `**${args[0]} ${args[1]}**`)
        }
        break

      case "add":
        if(config.gods.includes(msg.author.id) && args.length >= 2){
          db.simples.insert({
            command: args[0],
            return: args[1],
            server: msg.guild.id
          }, (err, doc)=>{
            debug.log(`Added command ${colors.blue(`${args[0]} ${args[1]}`)} to server ${colors.blue(msg.guild.name)}`)
            msg.channel.send(`Added command **${config.prefix}${args[0]}** to server **${msg.guild.name}**`)
          })
        }
        break

      case "remove":
        if(config.gods.includes(msg.author.id) && args.length >= 1){
          db.simples.remove({
            command: args[0],
            server: msg.guild.id
          }, (err, doc)=>{
            debug.log(`Removed command ${colors.blue(`${args[0]}`)} from server ${colors.blue(msg.guild.name)}`)
            msg.channel.send(`Removed command **${config.prefix}${args[0]}** from server **${msg.guild.name}**`)
          })
        }
        break

      case "roll":
        if(args[0]){
          dice = args[0].replace(/\D/g,'')
        } else {
          dice = 100
        }

        roll = Math.floor(Math.random() * dice) + 1

        msg.channel.send(`:game_die: ${msg.author} rolled ${md.code(roll)} out of ${md.code(dice)}`)
        debug.log(`${colors.blue("@"+msg.author.username)} rolled ${colors.green(roll)} out of ${colors.green(dice)}`)
        break
    
      default:
        module.exports.simple(cmd, args, msg, client)
        break

    }

  },
  simple: (cmd, args, msg=null, client=null) => {
    db.simples.findOne({
      command: cmd,
      server: msg.guild.id
    }, (err, doc)=>{
      if(doc){
        msg.channel.send(
          parseSimple(doc.return, args)
        )
      }
    })
  }
}