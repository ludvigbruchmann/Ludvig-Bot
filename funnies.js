getRandomElementFromArray = (array) => {
  return array[Math.floor(Math.random() * array.length)]
}

const kill = ["Oh, you're approaching me?", "You can't kill me, mortal!", "Just who do you think you are?", "Nope", "Nuh-uh", "Hell no", "You can't do that"]
const mortal = ["Nope", "Nuh-uh", "Hell no", "You can't do that"]

module.exports = {
  kill: () => {return getRandomElementFromArray(kill)},
  mortal: () => {return getRandomElementFromArray(mortal)},
  kills: kill,
  mortals: mortal
}