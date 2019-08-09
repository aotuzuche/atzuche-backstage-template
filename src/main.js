// reset css
import './assets/scss/common.scss'
import './style.scss'

// base framework
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import moment from 'moment'
import 'moment/locale/zh-cn'
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
