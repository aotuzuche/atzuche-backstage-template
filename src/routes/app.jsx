import React from 'react'
import { Link } from 'react-router-dom'
import './style.scss'

import Aside from '../components/aside'
import Header from '../components/header'
import Footer from '../components/footer'
import { Layout, Breadcrumb, message } from 'antd'
const { Content } = Layout
import { getParents, deepFindPath } from '../utils/deepFind.js'
import { connect } from 'react-redux'
import appConfig from '../../appConfig'
import Tool from '../hoc/tool'

@Tool
class App extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      collapsed: false,
      loading: false
    }
  }

  async componentDidMount() {
    try {
      this.setState({
        loading: true
      })
      // 如果已经是pathname则不需要一直请求，dev上会无限循环
      if (this.props.location.pathname === '/system/login') {
        return
      }
      await this.fetchMenu()
    } catch (e) {
      console.error(e)
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

  // 更新面包屑
  async updateBreadcrumb(path) {
    const { props } = this
    const paths = deepFindPath(path, this.props.index.menus)
    const breadcrumb = getParents(paths, this.props.index.menus)
    // await props.$main.updateBreadcrumb({
    //   breadcrumb
    // })

    props.dispatch({
      type: 'index/set',
      payload: {
        breadcrumb
      }
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
      collapsed: e
    })
  }

  deepMenuUrl = menu => {
    if (menu.children) {
      return this.deepMenuUrl(menu.children[0])
    }
    return menu.url
  }

  // 获取菜单数据
  fetchMenu = async () => {
    // 获取登录权限和资源数据，获取资源数据更新menuList，放在store中
    await this.props.dispatch({
      type: 'index/fetchSystemMenu',
      payload: { syscode: appConfig.prodPath }
    })
    console.log('fetchMenu', this.props.index)
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

  render(props) {
    console.log(1111, this)
    const { menus, breadcrumb } = this.props.index
    const { state } = this
    return (
      <Layout className="page">
        <Aside
          list={menus}
          onMenuHandle={this.onMenuHandle}
          collapsed={state.collapsed}
          onCollapse={this.onCollapse}
          defaultMenu={props.location.pathname}
        />
        <Layout>
          <Header collapsed={state.collapsed} onCollapse={::this.onCollapse} />

          <Content className="content">
            <div className="breadcrumb">
              <Breadcrumb>
                <Breadcrumb.Item>首页</Breadcrumb.Item>
                {breadcrumb &&
                  breadcrumb.map((item, index) => {
                    if (index === breadcrumb.length - 1) {
                      return (
                        <Breadcrumb.Item key={item.id}>
                          {item.name}
                        </Breadcrumb.Item>
                      )
                    }
                    return (
                      <Breadcrumb.Item key={item.id}>
                        {item.path ? (
                          <Link to={item.url}>{item.name}</Link>
                        ) : (
                          item.title
                        )}
                      </Breadcrumb.Item>
                    )
                  })}
              </Breadcrumb>
            </div>
            {this.props.children}
          </Content>

          <Footer />
        </Layout>
      </Layout>
    )
  }
}

export default connect(({ index }) => ({
  index
}))(App)
