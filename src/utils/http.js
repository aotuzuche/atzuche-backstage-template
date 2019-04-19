import axios from 'axios'
import { getToken, clearToken } from './token'

function HttpError(result) {
  const { resMsg, resCode, data } = result
  this.msg = resMsg
  this.name = 'HttpError'
  this.data = data
  this.code = resCode
}
HttpError.prototype = new Error()
HttpError.prototype.constructor = HttpError

const config = {
  production: '/apigateway/',
  development: '/proxy/apigateway/',
  test: '/apigateway/'
}

const baseURL = config[process.env.PACKAGE] ? config[process.env.PACKAGE] : config['development']

const http = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json;version=3.0;compress=false',
    'Content-Type': 'application/json;charset=utf-8'
  }
})

http.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = token
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

http.interceptors.response.use(
  (config) => {
    if (config.data.resCode === '000000') {
      return config.data.data
    }

    if (config.data.resCode === '200008') {
      clearToken()
      history.replaceState(null, '', '/system/login')
      location.reload()
      return
    }

    return Promise.reject(new HttpError(config.data))
  },
  (err) => {
    console.error(err)
    Promise.reject(new HttpError('系统错误'))
  }
)

export default http
