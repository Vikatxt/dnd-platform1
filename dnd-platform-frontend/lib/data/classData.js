// lib/data/classData.js

const classData = {
  'Воїн': {
    hitDie: 10,
    savingThrows: ['STR', 'CON'],
    primaryStats: ['STR', 'CON'],
  },
  'Маг': {
    hitDie: 6,
    savingThrows: ['INT', 'WIS'],
    primaryStats: ['INT'],
  },
  'Плут': {
    hitDie: 8,
    savingThrows: ['DEX', 'INT'],
    primaryStats: ['DEX'],
  },
  'Клерик': {
    hitDie: 8,
    savingThrows: ['WIS', 'CHA'],
    primaryStats: ['WIS'],
  },
  'Рейнджер': {
    hitDie: 10,
    savingThrows: ['STR', 'DEX'],
    primaryStats: ['DEX', 'WIS'],
  },
  'Паладин': {
    hitDie: 10,
    savingThrows: ['WIS', 'CHA'],
    primaryStats: ['CHA', 'STR'],
  },
  'Бард': {
    hitDie: 8,
    savingThrows: ['DEX', 'CHA'],
    primaryStats: ['CHA'],
  },
  'Друїд': {
    hitDie: 8,
    savingThrows: ['INT', 'WIS'],
    primaryStats: ['WIS'],
  },
}

export default classData
