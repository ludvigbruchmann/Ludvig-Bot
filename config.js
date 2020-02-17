const fs = require('fs')
const configFilePath = "./data/config.json"

const defaultConfig = {
  token: "<INSERT TOKEN>",
  debug: true,
  prefix: "!",
  gods: ["179590092355141632"] // ALL POWERFUL USER, CAN SHUTDOWN, ONLY USE YOUR OWN ID, YOU CAN ALSO LEAVE MY ID HERE IF YOU TRUST ME
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