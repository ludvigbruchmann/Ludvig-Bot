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
  return output
}

function pollOptions(args){
  output = ""
  if(args.length>1){output+="\n1️⃣ "+args[1]}
  if(args.length>2){output+="\n2️⃣ "+args[2]}
  if(args.length>3){output+="\n3️⃣ "+args[3]}
  if(args.length>4){output+="\n4️⃣ "+args[4]}
  if(args.length>5){output+="\n5️⃣ "+args[5]}
  if(args.length>6){output+="\n6️⃣ "+args[6]}
  if(args.length>7){output+="\n7️⃣ "+args[7]}
  if(args.length>8){output+="\n8️⃣ "+args[8]}
  if(args.length>9){output+="\n9️⃣ "+args[9]}
  if(args.length>10){output+="\n🔟 "+args[10]}
  return output
}

async function pollReactions(msg, args){
  if(args.length>1){await msg.react("1️⃣")}
  if(args.length>2){await msg.react("2️⃣")}
  if(args.length>3){await msg.react("3️⃣")}
  if(args.length>4){await msg.react("4️⃣")}
  if(args.length>5){await msg.react("5️⃣")}
  if(args.length>6){await msg.react("6️⃣")}
  if(args.length>7){await msg.react("7️⃣")}
  if(args.length>8){await msg.react("8️⃣")}
  if(args.length>9){await msg.react("9️⃣")}
  if(args.length>10){await msg.react("🔟")}
  return output
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

      case "poll":
        if(args.length>0){
          if(args.length==1){ // yes/no poll, no options
            msg.channel.send(`**${args[0]}**`).then(poll => {
              poll.react("👍")
              poll.react("👎")
            })
          } else {
            options = args.slice(1,10)
            msg.channel.send(`**${args[0]}**\n${pollOptions(args)}`).then(async poll => {
              pollReactions(poll, args)
            })
          }
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

      case "help":
        db.simples.find({
          server: msg.guild.id
        }, (err, doc)=>{
          if(doc){
            helpList = [config.prefix + "roll"]
            for (let i = 0; i < doc.length; i++) {
              helpList.push(config.prefix+doc[i].command)
            }
            msg.channel.send("```" + helpList + "```")
          }
        })
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
