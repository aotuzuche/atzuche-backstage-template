import React from 'react'
import appConfig from '../../appConfig'
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import App from './app'
import RouteChangeListener from '../container/routeChangeListener'
import HomeView from '../views/home'

// 配置路由
const Routes = e => {
  return (
    <BrowserRouter basename={appConfig.basename}>
      <ConfigProvider locale={zh_CN}>
        <App>
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
