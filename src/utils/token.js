const token = 'auto_system_token'
const data = 'auto_system_userData'

export const setToken = e => localStorage.setItem(token, e)
export const getToken = () => localStorage.getItem(token)
export const clearToken = () => {
  localStorage.removeItem(token)
  localStorage.removeItem(data)
}

export const getUserInfo = () => {
  return localStorage[data] ? JSON.parse(localStorage[data]) : null
}

export const initToken = async e => {
  return new Promise((resolve, reject) => {
    const token = getToken()
    if (token) {
      resolve()
    } else {
      reject()
    }
  })
}

export const toLogin = e => {
  window.location.href = '/system/login'
}
