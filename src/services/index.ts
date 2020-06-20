import { httpConsole } from 'auto-libs'

export interface fetchSystemMenuPayload {
  syscode: string
}

const fetchSystemMenu = (payload: fetchSystemMenuPayload) => {
  return httpConsole.request({
    url: `/apigateway/auth/console/auth/menu/${payload.syscode}`,
    method: 'GET',
  })
}

export default {
  fetchSystemMenu,
}
