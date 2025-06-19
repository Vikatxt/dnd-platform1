// Валидация email с использованием регулярного выражения
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };
  
  // Валидация пароля
  const validatePassword = (password) => {
    // Минимум 8 символов, должен содержать буквы и цифры
    return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
  };
  
  // Валидация номера телефона (более гибкая версия)
  const validatePhone = (phone) => {
    // Разрешаем международные номера разной длины
    // Проверяем, что номер начинается с + и содержит только цифры далее
    const re = /^\+\d{6,15}$/;
    return re.test(phone);
  };
  
  module.exports = {
    validateEmail,
    validatePassword,
    validatePhone
  }; 