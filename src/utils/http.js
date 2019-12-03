import { httpConsole } from 'auto-libs'

httpConsole.interceptors.request.use(config => {
  config.baseURL = '/apigateway'

  return config
})

export default httpConsole
