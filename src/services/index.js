import http from '../utils/http'

const fetchSystemMenu = payload => {
  console.log(2222222, payload)
  return http.request({
    url: `/auth/console/auth/menu/${payload.syscode}`,
    method: 'GET'
  })
}

export default {
  fetchSystemMenu
}
