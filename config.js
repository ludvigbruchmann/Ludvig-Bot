const fs = require('fs')
const configFilePath = "./data/config.json"

const defaultConfig = {
  // Configure you config in data/config.json
  token: "<INSERT TOKEN>",
  debug: true,
  prefix: "!",
  gods: [] // ALL POWERFUL USER, CAN SHUTDOWN, ONLY USE YOUR OWN ID
}

config = null

if (fs.existsSync(configFilePath)) {
  raw = fs.readFileSync(configFilePath)
  config = JSON.parse(raw)
} else {
  fs.writeFile(configFilePath, JSON.stringify(defaultConfig), (err)=>{if(err){console.log(err)}})
  config = defaultConfig
}

module.exports = config