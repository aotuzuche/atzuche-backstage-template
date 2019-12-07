import './style'
import React from 'react'
import { clearToken } from 'auto-libs'
import { Layout, Icon } from 'antd'

class HeaderView extends React.PureComponent {
  constructor(props) {
    super(props)

    this.userInfo = localStorage['auto_system_userData']
      ? JSON.parse(localStorage['auto_system_userData'])
      : {}

    const name = this.userInfo.loginName ? this.userInfo.loginName : ''

    const now = new Date()
    const hour = now.getHours()
    let hello = ''

    // 0:00 ~ 5:59
    if (hour > 0 && hour < 6) {
      hello = '凌晨好：'
    }
    // 6:00 ~ 10:59
    else if (hour >= 6 && hour < 11) {
      hello = '上午好：'
    }
    // 11:00 ~ 12:59
    else if (hour >= 11 && hour < 13) {
      hello = '中午好：'
    }
    // 13:00 ~ 17:59
    else if (hour >= 13 && hour < 18) {
      hello = '下午好：'
    }
    // 16:00 ~ 23:59
    else {
      hello = '晚上好：'
    }

    this.state = {
      triggerIcon: 'fold',
      loginName: name,
      hello,
    }
  }

  UNSAFE_componentWillUpdate(props) {
    if (this.props.collapsed !== props.collapsed) {
      // eslint-disable-next-line react/no-will-update-set-state
      this.setState({
        triggerIcon: props.collapsed ? 'unfold' : 'fold',
      })
    }
  }

  // 点击ICon菜单收起或者展开
  onTrigger = () => {
    this.props.onCollapse && this.props.onCollapse(!this.props.collapsed)
  }

  onGoMain = () => {
    history.replaceState(null, '', '/system')
    location.reload()
  }

  onLogout = () => {
    clearToken()
    history.replaceState(null, '', '/system/login')
    location.reload()
  }

  render() {
    const { state } = this
    return (
      <Layout.Header className="auto-header-bar">
        <Icon
          type={'menu-' + state.triggerIcon}
          onClick={this.onTrigger}
          className="auto-trigger"
        />
        <div className="auto-userInfo">
          <p>
            {this.state.hello}
            <strong>{this.state.loginName}</strong>
          </p>
          <p>
            <a href="javascript:;" onClick={this.onGoMain}>
              <Icon type="appstore-o" />
              返回入口
            </a>
            <a href="javascript:;" onClick={this.onLogout}>
              <Icon type="poweroff" />
              退出登录
            </a>
          </p>
        </div>
      </Layout.Header>
    )
  }
}

export default HeaderView
