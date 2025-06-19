const prisma = require('../utils/prisma'); // Або '../config/prisma', якщо створив там


const rollDice = (sides) => Math.floor(Math.random() * sides) + 1;

const roll = async (req, res) => {
  try {
    const { dice, modifier } = req.body; // Наприклад: { dice: "d20", modifier: 2 }
    const sides = parseInt(dice.substring(1));

    if (![4, 6, 8, 10, 12, 20].includes(sides)) {
      return res.status(400).json({ error: "Invalid dice type" });
    }

    const result = rollDice(sides) + (modifier || 0);
    res.json({ dice, result, modifier });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { roll };
