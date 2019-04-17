import React, { PureComponent } from 'react'
import './style.scss'
import { connect } from 'react-redux'
import { Layout, Menu, Icon, message } from 'antd'

const { Sider } = Layout
const { SubMenu } = Menu

import { deepFind, deepFindPath, getParents } from 'src/utils/deepFind'

class AsideView extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      selectedKeys: [],
      openKeys: []
    }
  }

  UNSAFE_componentWillMount() {
    this.updateBreadcrumb()
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.defaultMenu !== nextProps.defaultMenu) {
      this.setState({}, () => {
        this.setMenuKey()
      })
    }
    if (nextProps.list !== this.props.list) {
      this.setState({}, () => {
        this.setMenuKey()
      })
    }
  }

  componentDidCatch(error) {
    console.error(error)
  }

  // 设置默认选中状态
  setMenuKey() {
    const { props } = this
    const currentMenu = deepFind(props.defaultMenu, props.list, 'url')
    let selectedKeys = currentMenu ? [].concat(String(currentMenu.id)) : []
    // 如果是子菜单，那么父菜单需要打开
    if (currentMenu && currentMenu.pid) {
      // 插入选中key
      selectedKeys.unshift(String(currentMenu.pid))
      this.setState({
        openKeys: [].concat(currentMenu.pid.toString()),
        selectedKeys
      })
      return
    }
    // 临时解决
    this.setState({
      selectedKeys:
        selectedKeys.length > 0 ? selectedKeys : this.state.selectedKeys
    })
  }

  // 更新面包屑
  async updateBreadcrumb() {
    const { props } = this
    const paths = deepFindPath(props.defaultMenu, props.list)
    const breadcrumb = getParents(paths, props.list)

    // await props.$main.updateBreadcrumb({
    //   breadcrumb
    // })
    this.props.dispatch({
      type: 'index/set',
      payload: {
        breadcrumb
      }
    })
  }

  // 递归菜单
  recursionMenu(obj) {
    if (!(obj instanceof Array)) {
      return null
    }
    return obj.map(item => {
      // 判断是否有子菜单
      /* if(item.children instanceof Array && item.showSubMenu){ */
      if (item.children instanceof Array) {
        return (
          <SubMenu
            key={item.id}
            title={
              <span>
                {item.icon ? <Icon type={item.icon} /> : null}
                <span>{item.name}</span>
              </span>
            }
          >
            {this.recursionMenu(item.children)}
          </SubMenu>
        )
      }

      return (
        <Menu.Item key={item.id}>
          {item.icon ? <Icon type={item.icon} /> : null}
          <span>{item.name}</span>
        </Menu.Item>
      )
    })
  }

  // 菜单点击事件
  onMenuHandle = e => {
    try {
      const _current = deepFind(e.key, this.props.list)
      if (_current) {
        this.props.onMenuHandle(_current.url)
      }
    } catch (e) {
      console.log(e)
      message.error(e.msg || '系统异常')
    }
  }

  // 菜单选中
  onMenuSelect = e => {
    const selectedKeys = e.selectedKeys
    this.setState({
      selectedKeys
    })
  }

  // 自动监测收起或者关闭菜单
  onCollapse = collapsed => {
    this.props.onCollapse(collapsed)
  }

  render() {
    const { props } = this
    return (
      <Sider
        className="sider"
        width="256"
        collapsedWidth="80"
        breakpoint="xl"
        collapsed={props.collapsed}
        onCollapse={this.onCollapse}
      >
        <div className="logo">
          <img
            src="https://carphoto.aotuzuche.com/web/images/webSystem/icon_logo.png"
            alt="logo"
          />
          <h1>凹凸租车管理后台</h1>
        </div>
        <Menu
          openKeys={this.state.openKeys}
          selectedKeys={this.state.selectedKeys}
          mode="inline"
          theme="dark"
          onClick={::this.onMenuHandle}
          onSelect={::this.onMenuSelect}
          onOpenChange={e => {
            this.setState({
              openKeys: e
            })
          }}
        >
          {this.recursionMenu(props.list)}
        </Menu>
      </Sider>
    )
  }
}

export default connect(index => ({
  index
}))(AsideView)
