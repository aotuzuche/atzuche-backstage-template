import React, { FC } from 'react'
import appConfig from '../../appConfig'
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import App from './app'
import HomeView from '../views/home'
import RouteChangeListener from './routeChangeListener'
import { DevLogin } from 'at-console-components'

const Routes: FC = e => {
  return (
    <BrowserRouter basename={appConfig.basename}>
      <ConfigProvider locale={zh_CN}>
        <App>
          {/* 请勿删除 */}
          <Route component={RouteChangeListener} />
          <Switch>
            {/* 请勿删除，开发环境专用 */}
            {process.env.NODE_ENV === 'development' && (
              <Route path="/system/login" exact={true} component={DevLogin} />
            )}

            <Route path="/" component={HomeView} />
            <Redirect to="/" />
          </Switch>
        </App>
      </ConfigProvider>
    </BrowserRouter>
  )
}

export default Routes
