const config = require('./config')

module.exports = {
  log: (str) => {
    if (config.debug) {
      console.log(`[${new Date().toLocaleString()}] ${str}`)
    }
  }
}