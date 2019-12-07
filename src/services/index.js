import { httpConsole } from 'auto-libs'

const fetchSystemMenu = payload => {
  return httpConsole.request({
    url: `/apigateway/auth/console/auth/menu/${payload.syscode}`,
    method: 'GET',
  })
}

export default {
  fetchSystemMenu,
}
