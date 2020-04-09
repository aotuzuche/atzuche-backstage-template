import './style.scss'

import React from 'react'
import { Layout, Breadcrumb, message } from 'antd'
import { connect } from 'react-redux'

import Aside from '../components/aside'
import Header from '../components/header'
import { getMenuPathInfos, findMenuPathIds } from '../utils/menuHandles'
import appConfig from '../../appConfig'
import Tool from '../hoc/tool'

const { Content } = Layout

const dimensionMaxMap = {
  xs: '479.98px',
  sm: '575.98px',
  md: '767.98px',
  lg: '991.98px',
  xl: '1199.98px',
  xxl: '1599.98px',
}

@Tool
class App extends React.PureComponent {
  mql = null

  constructor(props) {
    super(props)

    this.state = {
      collapsed: false,
      loading: false,
      below: false,
    }

    this.initMediaQuery()
  }

  async componentDidMount() {
    try {
      if (this.mql) {
        this.mql.addListener(this.matchMediaAddListener)
        this.matchMediaAddListener(this.mql)
      }

      this.setState({
        loading: true,
      })
      // 如果已经是pathname则不需要一直请求，dev上会无限循环
      if (this.props.location.pathname === '/system/login') {
        return
      }
      await this.fetchMenu()
    } catch (e) {
      message.error(e.msg || '系统错误，请稍后再试')
    } finally {
      this.setState({ loading: false })
    }
  }

  UNSAFE_componentWillUpdate(p, s) {
    if (p.location.pathname !== this.props.location.pathname) {
      const path = p.location.pathname
      this.updateBreadcrumb(path)
    }
  }

  initMediaQuery = () => {
    let matchMedia
    const { breakpoint = 'md' } = this.props
    if (typeof window !== void 0) {
      matchMedia = window.matchMedia
    }

    if (matchMedia && breakpoint in dimensionMaxMap) {
      this.mql = matchMedia(`(max-width: ${dimensionMaxMap[breakpoint]})`)
    }
  }

  matchMediaAddListener = mql => {
    this.setState({
      below: mql.matches,
    })
  }

  // 菜单点击回调
  onMenuHandle = path => {
    this.props.history.push(path)
    this.updateBreadcrumb(path)
  }

  // 侧边栏回调
  onCollapse = e => {
    this.setState({
      collapsed: e,
    })
  }

  deepMenuUrl = menu => {
    if (menu.children && menu.children[0].icon !== false && menu.children[0].icon !== 'false') {
      return this.deepMenuUrl(menu.children[0])
    }
    return menu.url
  }

  // 获取菜单数据
  fetchMenu = async () => {
    // 获取登录权限和资源数据，获取资源数据更新menuList，放在store中
    await this.props.dispatch({
      type: 'index/fetchSystemMenu',
      payload: { syscode: appConfig.syscode },
    })

    const menu = this.props.index.menus
    // 如果菜单长度大于0,并且当前path为/,则跳转至菜单第一个url
    if (menu.length > 0 && this.props.history.location.pathname === '/') {
      const url = menu[0] ? this.deepMenuUrl(menu[0]) : '/'
      this.props.history.replace(url)
    }
    const path = this.props.location.pathname
    // 更新面包屑
    this.updateBreadcrumb(path)
  }

  go = i => () => {
    this.props.history.go(i)
  }

  // 更新面包屑
  async updateBreadcrumb(path) {
    const { props } = this
    const ids = findMenuPathIds(path, this.props.index.menus)
    const breadcrumb = getMenuPathInfos(ids, this.props.index.menus)

    props.dispatch({
      type: 'index/set',
      payload: { breadcrumb },
    })
  }
  render(props) {
    const { children, index } = this.props
    const { collapsed, below } = this.state
    const { menus, breadcrumb } = index
    const len = breadcrumb && breadcrumb.length
    const renderBradcrumb = e => {
      return (
        <Breadcrumb>
          <Breadcrumb.Item>首页</Breadcrumb.Item>
          {breadcrumb &&
            breadcrumb.map((item, index) => {
              return (
                <Breadcrumb.Item key={item.id}>
                  {len - 1 === index || !item.url ? (
                    <span>{item.name}</span>
                  ) : (
                    <a
                      onClick={() => {
                        this.props.history.push(item.url)
                      }}
                      herf="javascript;;"
                    >
                      {item.name}
                    </a>
                  )}
                </Breadcrumb.Item>
              )
            })}
        </Breadcrumb>
      )
    }

    return (
      <Layout className="auto-wrapper">
        {!below && (
          <Aside
            list={menus}
            onMenuHandle={this.onMenuHandle}
            collapsed={collapsed}
            onCollapse={this.onCollapse}
            defaultMenu={this.props.location.pathname}
          />
        )}
        <Layout>
          <Header collapsed={collapsed} onCollapse={this.onCollapse} />
          <div className="auto-breadcrumb">{renderBradcrumb()}</div>
          <Content className="auto-mainbody">{children}</Content>
        </Layout>
      </Layout>
    )
  }
}

export default connect(({ index }) => ({
  index,
}))(App)
