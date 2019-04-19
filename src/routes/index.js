import React from 'react'
import appConfig from '../../appConfig'
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom'
import { LocaleProvider } from 'antd'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import App from './app'
import HomeView from '../views/home'

// 配置路由
const Routes = e => {
  return (
    <BrowserRouter basename={appConfig.basename}>
      <LocaleProvider locale={zh_CN}>
        <App>
          <Switch>
            <Route path="/" component={HomeView} />
            <Redirect to="/" />
          </Switch>
        </App>
      </LocaleProvider>
    </BrowserRouter>
  )
}

export default Routes
