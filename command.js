const colors = require('colors')
const debug = require('./debug')
const config = require('./config')
const funnies = require('./funnies')
const md = require('./md')

const package = require('./package.json');

const Datastore = require('nedb')
var db = {
  simples: new Datastore({filename: 'data/simples.json', autoload: true}),
  roleReacts: new Datastore({filename: 'data/roleReacts.json', autoload: true})
}

function parseSimple(simple, args){
  output = simple
    .replace(/(?!\\)\$v/g, package.version)
    .replace(/(?!\\)\$version/g, package.version)
  return output
}

function pollOptions(embed, args){
  if(args.length>1){embed.fields.push({name:"\n1️⃣",value: args[1]})}
  if(args.length>2){embed.fields.push({name:"\n2️⃣",value: args[2]})}
  if(args.length>3){embed.fields.push({name:"\n3️⃣",value: args[3]})}
  if(args.length>4){embed.fields.push({name:"\n4️⃣",value: args[4]})}
  if(args.length>5){embed.fields.push({name:"\n5️⃣",value: args[5]})}
  if(args.length>6){embed.fields.push({name:"\n6️⃣",value: args[6]})}
  if(args.length>7){embed.fields.push({name:"\n7️⃣",value: args[7]})}
  if(args.length>8){embed.fields.push({name:"\n8️⃣",value: args[8]})}
  if(args.length>9){embed.fields.push({name:"\n9️⃣",value: args[9]})}
  if(args.length>10){embed.fields.push({name:"\n🔟",value: args[10]})}
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
}

async function yesNoPollReactions(msg){
  await msg.react("👍")
  await msg.react("🤷‍♀️")
  await msg.react("👎")
}

function isCustomEmoji(emoji) {
  const matchEmoji = /^(:[^:\s]+:|<:[^:\s]+:[0-9]+>|<a:[^:\s]+:[0-9]+>)+$/
  return matchEmoji.test(emoji)
}

function getRole(mention, roles) {
	// The id is the first and only match found by the RegEx.
	const matches = mention.match(/^<@&!?(\d+)>$/);

	// If supplied variable was not a mention, matches will be null instead of an array.
	if (!matches) return;

	// However the first element in the matches array will be the entire mention, not just the ID,
	// so use index 1.
	const id = matches[1];

	return roles.cache.get(id);
}

module.exports = {
  db: db,
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
        } else {
          msg.reply(funnies.mortal())
        }
        break

      case "poll":
        if(args.length>0){
          embed = {
            title: args[0],
            color: 0x7289DA,
            author: {
              name: msg.author.username,
              icon_url: msg.author.avatarURL
            },
            footer: {text: "📄 React to this poll to vote"},
            fields: [],
            timestamp: new Date()
          }
          if(args.length==1){ // yes/no poll, no options
            msg.channel.send({embed:embed}).then(poll => {
              yesNoPollReactions(poll)
            })
          } else {
            options = args.slice(1,10)
            pollOptions(embed, args)
            msg.channel.send({embed:embed}).then(async poll => {
              pollReactions(poll, args)
            })
          }
          msg.delete()
        }
        break

      case "role":
        if(config.gods.includes(msg.author.id) && args.length >= 2){
          if(isCustomEmoji(args[0])){
            emoji = args[0].replace(/\D/g,'')
            role = getRole(args[1], msg.guild.roles)

            reactString = `React ${msg.guild.emojis.cache.get(emoji)} to be assigned to ${msg.guild.roles.cache.get(role.id)}`
            embed = {
              title: null,
              color: 0x7289DA,
              author: {
                name: role.name,
                icon_url: msg.guild.emojis.cache.get(emoji).url
              },
              footer: {text: "📄 React to this message to be assigned a role"},
              description: reactString,
              timestamp: new Date()
            }
            
            
            msg.channel.send({embed:embed}).then(roleMsg => {
              msg.delete()
              roleMsg.react(emoji)

              db.roleReacts.insert({
                server: msg.guild.id,
                msg: roleMsg.id,
                roles: [
                  {emoji: emoji,
                  role: role.id}
                ]
              }, (err, doc) => {
                if(err){debug.log(err)}
              })
              
            })
          }
        } else {
          msg.reply(funnies.mortal())
        }
        break

      // #TODO: Multi role reacts

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
        } else {
          msg.reply(funnies.mortal())
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
        } else {
          msg.reply(funnies.mortal())
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
            helpList = [config.prefix + "poll", config.prefix + "roll"]
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
