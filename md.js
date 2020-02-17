module.exports = {
  code: (str) => {return "`" + str + "`"},
  codeBlock: (str) => {return "```" + str + "```"},
  italic: (str) => {return "*" + str + "*"},
  bold: (str) => {return "**" + str + "**"}
}