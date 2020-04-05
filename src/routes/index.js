import React from 'react'
import appConfig from '../../appConfig'
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import App from './app'
import HomeView from '../views/home'

// onlistener router
import RouteChangeListener from './routeChangeListener'

// 配置路由
const Routes = e => {
  return (
    <BrowserRouter basename={appConfig.basename}>
      <ConfigProvider locale={zh_CN}>
        <App>
          {/* 请勿删除 */}
          <Route component={RouteChangeListener} />

          <Switch>
            <Route path="/" component={HomeView} />
            <Redirect to="/" />
          </Switch>
        </App>
      </ConfigProvider>
    </BrowserRouter>
  )
}

export default Routes
