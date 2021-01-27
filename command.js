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

function pollOptions(embed, options, emojis=["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"]){
  if(options.length>=1){embed.fields.push({name:`\n${emojis[0]}`,value: options[0]})}
  if(options.length>=2){embed.fields.push({name:`\n${emojis[1]}`,value: options[1]})}
  if(options.length>=3){embed.fields.push({name:`\n${emojis[2]}`,value: options[2]})}
  if(options.length>=4){embed.fields.push({name:`\n${emojis[3]}`,value: options[3]})}
  if(options.length>=5){embed.fields.push({name:`\n${emojis[4]}`,value: options[4]})}
  if(options.length>=6){embed.fields.push({name:`\n${emojis[5]}`,value: options[5]})}
  if(options.length>=7){embed.fields.push({name:`\n${emojis[6]}`,value: options[6]})}
  if(options.length>=8){embed.fields.push({name:`\n${emojis[7]}`,value: options[7]})}
  if(options.length>=9){embed.fields.push({name:`\n${emojis[8]}`,value: options[8]})}
  if(options.length>=10){embed.fields.push({name:`\n${emojis[9]}`,value: options[9]})}
}

async function pollReactions(msg, options, emojis=["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"]){
  if(options.length>=1){await msg.react(emojis[0])}
  if(options.length>=2){await msg.react(emojis[1])}
  if(options.length>=3){await msg.react(emojis[2])}
  if(options.length>=4){await msg.react(emojis[3])}
  if(options.length>=5){await msg.react(emojis[4])}
  if(options.length>=6){await msg.react(emojis[5])}
  if(options.length>=7){await msg.react(emojis[6])}
  if(options.length>=8){await msg.react(emojis[7])}
  if(options.length>=9){await msg.react(emojis[8])}
  if(options.length>=10){await msg.react(emojis[9])}
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
        if(args.length>0){
          if(args[1] == "-e"){ // if first argument is -e use custom emojis for poll
            emojis = args[2].split(" ")
            options = args.slice(3,12)
            if(emojis.length==options.length){
              pollOptions(embed, options, emojis)
              msg.channel.send({embed:embed}).then(async poll => {
                pollReactions(poll, options, emojis)
              })
              msg.delete()
            } else {
              msg.react("👎")
              debug.log(colors.red("Error: Amount of emojis do not match amount of poll options"))
              debug.log(emojis)
              debug.log(options)
            }
          } else if(args.length==1){ // yes/no poll, no options
            msg.channel.send({embed:embed}).then(poll => {
              yesNoPollReactions(poll)
            })
            msg.delete()
          } else {
            options = args.slice(1,10)
            pollOptions(embed, options)
            msg.channel.send({embed:embed}).then(async poll => {
              pollReactions(poll, options)
            })
            msg.delete()
          }
        }
        break

      case "role":
        if(config.gods.includes(msg.author.id) && args.length >= 2){ // #TODO: Should check for role assignment permission rather than 'gods'
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
