import React, { FC } from 'react'
import appConfig from '../../appConfig'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import HomeView from '../views/home'

const Routes: FC = () => {
  return (
    <BrowserRouter basename={appConfig.basename}>
      <Switch>
        <Route path="/" component={HomeView} />
      </Switch>
    </BrowserRouter>
  )
}

export default Routes
