// reset css
import './assets/scss/common.scss'
import './style.scss'

// base framework
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import moment from 'moment'
import 'moment/locale/zh-cn'
// import { setConsoleToken } from 'auto-libs'
moment.locale('zh-cn')

// dev环境下mock数据支持，有真实数据即可删除
import Mock from 'mockjs'

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

/*
 * development mock datas
 * mock menu data
 * mock table data
 * 有真实数据之后即可删除此mock
 */

if (process.env.NODE_ENV === 'development') {
  Mock.mock(
    /\/demo\/fetchTableList/,
    Mock.mock({
      total: 50,
      'list|10': [
        {
          'id|+1': 1,
          name: '测试',
        },
      ],
      pageNum: 1,
      pageSize: 10,
    }),
  )

  Mock.mock(
    /\/apigateway\/auth\/console\/auth\/menu\//,
    Mock.mock({
      list: [
        {
          id: 406,
          name: '首页',
          icon: 'car',
          url: '/',
          pid: 0,
          systemId: 35,
        },
        {
          id: 415,
          name: '列表',
          icon: 'car',
          url: '/list',
          pid: 0,
          systemId: 35,
        },
      ],
    }),
  )
}
