// utils/validators.js (frontend)
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(String(email).toLowerCase())
}

export const validatePassword = (password) => {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password)
}

export const validatePhone = (phone) => {
  const re = /^\+\d{6,15}$/
  return re.test(phone)
}
