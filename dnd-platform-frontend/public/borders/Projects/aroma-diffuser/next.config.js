// next.config.js
module.exports = {
  output: 'export', // Устанавливаем экспорт как статический сайт
  images: {
    unoptimized: true, // Для статических сайтов
  },
  experimental: {
    optimizeCss: false, // Не обрезать CSS
  },
};
