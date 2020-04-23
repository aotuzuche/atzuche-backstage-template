// reset css
import './assets/scss/common.scss'
import './style.scss'

// base framework
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import moment from 'moment'
import 'moment/locale/zh-cn'
import { setConsoleToken } from 'auto-libs'
moment.locale('zh-cn')

// store
import store from './store'

// routes
import Router from './routes'

// render to #root
render(
  <Provider store={store} key={Math.random()}>
    <Router />
  </Provider>,
  document.getElementById('root'),
)

module.hot && module.hot.accept()

if (process.env.NODE_ENV === 'development') {
  setConsoleToken(
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqYmsiOiJ7XCJsb2dpbklkXCI6XCI0MDAwXCIsXCJsb2dpbk5hbWVcIjpcImFkbWluXCIsXCJsb2dpblRpbWVcIjoxNTg3NTQ3NjQ2NzU0LFwiaXNBZG1pblwiOjF9In0.R2ydZOOeGR_A-aAEdWd1WvgLC8z35-dJfpemuIbQzoQ',
  )
}
