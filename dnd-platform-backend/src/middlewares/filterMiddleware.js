const leoProfanity = require('leo-profanity')

// Очищаємо старий словник і додаємо потрібні мови
leoProfanity.clearList()
leoProfanity.loadDictionary('en')
leoProfanity.loadDictionary('ru')
leoProfanity.loadDictionary('uk')

const filterContent = (req, res, next) => {
  const text = req.body.content

  if (text && leoProfanity.isProfane(text)) {
    return res.status(400).json({ error: 'Нецензурна лексика заборонена' })
  }

  next()
}

module.exports = { filterContent }
