import React from 'react'
import appConfig from '../../appConfig'
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom'
import App from './app'
import HomeView from '../views/home'

// 配置路由
const Routes = e => {
  return (
    <BrowserRouter basename={appConfig.basename}>
      <App>
        <Switch>
          <Route path="/" component={HomeView} />
          <Redirect to="/" />
        </Switch>
      </App>
    </BrowserRouter>
  )
}

export default Routes
