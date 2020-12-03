import React, { FC } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import HomeView from '../views/home'
import { ConfigProvider } from 'antd'
import zh_CN from 'antd/lib/locale-provider/zh_CN'

const Routes: FC = () => {
  return (
    <ConfigProvider locale={zh_CN}>
      <Switch>
        <Route path="/<%= prodPath %>" component={HomeView} exact />
        <Redirect to="/<%= prodPath %>" />
      </Switch>
    </ConfigProvider>
  )
}

export default Routes
