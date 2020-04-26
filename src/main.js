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
        { id: 361, name: '携程订单对账', icon: null, url: '/orderCheck', pid: 0, systemId: 35 },
        {
          id: 406,
          name: '预收定金列表',
          icon: 'car',
          url: '/advanceReceived',
          pid: 0,
          systemId: 35,
        },
        {
          id: 415,
          name: '长租订单列表',
          icon: 'car',
          url: '/longRentOrder',
          pid: 0,
          systemId: 35,
        },
        {
          id: 416,
          name: '确认收款申请',
          icon: 'car',
          url: '/receivables/confirmReceipt',
          pid: 0,
          systemId: 35,
        },
        { id: 417, name: '应收流水管理', icon: 'car', url: null, pid: 0, systemId: 35 },
        {
          id: 418,
          name: '应收流水列表',
          icon: 'car',
          url: '/receivables/list',
          pid: 417,
          systemId: 35,
        },
        {
          id: 419,
          name: '收款调整申请',
          icon: 'car',
          url: '/receivables/adjustmentApply',
          pid: 417,
          systemId: 35,
        },
        { id: 420, name: '应付流水管理', icon: 'car', url: null, pid: 0, systemId: 35 },
        {
          id: 421,
          name: '应付流水列表',
          icon: 'car',
          url: '/payables/list',
          pid: 420,
          systemId: 35,
        },
        {
          id: 422,
          name: '付款调整申请',
          icon: 'car',
          url: '/payables/adjustmentApply',
          pid: 420,
          systemId: 35,
        },
        {
          id: 423,
          name: '打款申请管理',
          icon: 'car',
          url: '/paymentApply',
          pid: 0,
          systemId: 35,
        },
      ],
    }),
  )
}
