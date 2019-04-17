import React, { PureComponent } from 'react'
import './style.scss'

import { clearToken } from 'src/utils/token'

import { Layout, Menu, Icon, Dropdown } from 'antd'

const { Header } = Layout

import moment from 'moment'

class HeaderView extends PureComponent {
  constructor(props) {
    super(props)

    this.userInfo = localStorage['auto_system_userData']
      ? JSON.parse(localStorage['auto_system_userData'])
      : {}

    const name = this.userInfo.loginName ? this.userInfo.loginName : ''

    const time = this.userInfo.loginTime
      ? moment(this.toDate(this.userInfo.loginTime)).format('MM月DD HH:mm')
      : ''

    this.state = {
      triggerIcon: 'fold',
      infoVisible: false,
      loginName: name,
      loginTime: time
    }
  }

  UNSAFE_componentWillUpdate(props) {
    if (this.props.collapsed !== props.collapsed) {
      // eslint-disable-next-line react/no-will-update-set-state
      this.setState({
        triggerIcon: props.collapsed ? 'unfold' : 'fold'
      })
    }
  }

  toDate(str) {
    return `${str.substr(0, 4)}-${str.substr(4, 2)}-${str.substr(
      6,
      2
    )} ${str.substr(8, 2)}:${str.substr(10, 2)}:${str.substr(12, 2)}`
  }

  // 点击ICon菜单收起或者展开
  onTrigger = () => {
    this.props.onCollapse && this.props.onCollapse(!this.props.collapsed)
  }

  // 退出菜单
  infoMenu = () => (
    <Menu onClick={this.handleMenuClick} className="infoMenu">
      <Menu.Item className="infoSubMenu" key="1">
        <Icon type="arrow-left" />
        <span>返回主页</span>
      </Menu.Item>

      <Menu.Item className="infoSubMenu" key="2">
        <Icon type="logout" />
        <span>退出登录</span>
      </Menu.Item>
    </Menu>
  )

  // 退出菜单显示
  infoHandleVisibleChange = flag => {
    this.setState({ infoVisible: flag })
  }

  // 用户个人菜单点击，退出或者返回上一页
  handleMenuClick = e => {
    if (e.key === '1') {
      history.replaceState(null, '', '/system/')
      location.reload()
    } else if (e.key === '2') {
      clearToken()
      history.replaceState(null, '', '/system/login')
      location.reload()
    }
    return
  }

  render() {
    const { state } = this
    return (
      <Header className="header">
        <Icon
          type={`menu-${state.triggerIcon}`}
          onClick={this.onTrigger}
          className="trigger"
        />
        <div className="right">
          <Dropdown
            overlay={this.infoMenu()}
            onVisibleChange={this.infoHandleVisibleChange}
            visible={state.infoVisible}
          >
            <span className="userInfo">
              <span>
                你好：<em>{this.state.loginName}</em>
              </span>
              <span>上次登录时间：{this.state.loginTime}</span>
            </span>
          </Dropdown>
        </div>
      </Header>
    )
  }
}

export default HeaderView
