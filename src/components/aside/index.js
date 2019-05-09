import './style'
import appConfig from '../../../appConfig'
import React from 'react'
import { Layout, Menu, Icon, message } from 'antd'

const { Sider } = Layout
const { SubMenu } = Menu

import { findMenuInfo, findMenuPathIds } from '../../utils/menuHandles'

class AsideView extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      selectedKeys: [],
      openKeys: []
    }
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
  isFalse(icon) {
    return ['false', false, 0, '0'].includes(icon)
  }
  // 设置默认选中状态
  setMenuKey() {
    const { props } = this

    if (!props.list) {
      return
    }

    const currentMenu = findMenuInfo(props.defaultMenu, props.list, 'url')

    let selectedKeys = props.list[0] ? [props.list[0].id.toString()] : []
    let openKeys = []

    // 如果找到当前菜单，定位当前菜单，然后展开相关的菜单
    if (currentMenu) {
      let url = currentMenu.url
      const ids = findMenuPathIds(url, props.list)
      let find = false
      openKeys = ids.reverse().map((id) => {
        const menu = findMenuInfo(id, props.list)
        if (!find && !this.isFalse(menu.icon)) {
          selectedKeys = [menu.id.toString()]
          find = true
        }
        return id.toString()
      })
    }

    this.setState({
      openKeys: openKeys,
      selectedKeys: selectedKeys
    })
  }

  // 递归菜单
  recursionMenu(obj) {
    if (!(obj instanceof Array)) {
      return null
    }
    return obj.map((item) => {
      // 判断是否有子菜单
      let hasSub = false
      if (item.children instanceof Array) {
        // 如果所有的子菜单都是隐藏形式的话
        // 就认为该菜单没有子菜单
        hasSub = item.children.some((res) => !this.isFalse(res.icon))
      }

      if (hasSub) {
        return (
          <SubMenu
            key={item.id}
            title={
              <span>
                {item.icon ? <Icon type={item.icon} /> : <Icon type="folder" />}
                <span>{item.name}</span>
              </span>
            }
          >
            {this.recursionMenu(item.children)}
          </SubMenu>
        )
      }

      // 不显示隐藏形式的菜单
      if (this.isFalse(item.icon)) {
        return null
      }

      return (
        <Menu.Item key={item.id}>
          {item.icon ? <Icon type={item.icon} /> : <Icon type="file" />}
          <span>{item.name}</span>
        </Menu.Item>
      )
    })
  }

  // 菜单点击事件
  onMenuHandle = (e) => {
    try {
      const _current = findMenuInfo(e.key, this.props.list)
      if (_current) {
        this.props.onMenuHandle(_current.url)
      }
    } catch (e) {
      console.error(e)
      message.error(e.msg || '系统异常')
    }
  }

  // 菜单选中
  onMenuSelect = (e) => {
    const selectedKeys = e.selectedKeys
    this.setState({
      selectedKeys
    })
  }

  // 自动监测收起或者关闭菜单
  onCollapse = (collapsed) => {
    this.props.onCollapse(collapsed)
  }

  render() {
    const { props } = this
    return (
      <Sider
        className="auto-sider"
        width="256"
        collapsedWidth="80"
        breakpoint="xl"
        collapsed={props.collapsed}
        onCollapse={this.onCollapse}
      >
        <div className="auto-logo">
          <img src="//carphoto.aotuzuche.com/web/images/webSystem/icon_logo.png" alt="logo" />
          <h1>{appConfig.title}</h1>
        </div>
        <Menu
          openKeys={this.state.openKeys}
          selectedKeys={this.state.selectedKeys}
          mode="inline"
          theme="dark"
          onClick={this.onMenuHandle}
          onSelect={this.onMenuSelect}
          onOpenChange={(e) => {
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

export default AsideView
