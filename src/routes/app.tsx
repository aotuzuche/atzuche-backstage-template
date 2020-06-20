import React, { FC, useEffect, useRef } from 'react'
import './style.scss'
import { Layout, Breadcrumb, message } from 'antd'
import ResponsiveObserve, { ScreenMap } from 'antd/lib/_util/responsiveObserve'
import { getMenuPathInfos, findMenuPathIds } from 'at-console-components/lib/utils/menuHandles'
import appConfig from '../../appConfig'
import { Header, Aside } from 'at-console-components'
import { useSetState, useLocation } from 'react-use'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

const { Content } = Layout

interface AppState {
  screens: ScreenMap
  collapsed: boolean
  loading: boolean
  fixedAside: boolean
}

const App: FC = ({ children }) => {
  const mediascreen = useRef<string>()
  const dispatch = useDispatch()
  const location = useLocation()
  const history = useHistory()

  const { menus, breadcrumb } = useSelector((store: any) => store.index)

  const [state, setState] = useSetState<AppState>({
    collapsed: false,
    loading: false,
    fixedAside: false,
    screens: {
      xs: true,
      sm: true,
      md: true,
      lg: true,
      xl: true,
      xxl: true,
    },
  })

  // 更新面包屑
  const updateBreadcrumb = async (path = location.pathname) => {
    const ids = findMenuPathIds(path as string, menus)
    const breadcrumb = getMenuPathInfos(ids as never, menus)

    dispatch({
      type: 'index/set',
      payload: { breadcrumb },
    })
  }

  const deepMenuUrl = (menu: any): any => {
    if (menu.children && menu.children[0].icon !== false && menu.children[0].icon !== 'false') {
      return deepMenuUrl(menu.children[0])
    }
    return menu.url
  }

  const fetchMenu = async () => {
    await dispatch({
      type: 'index/fetchSystemMenu',
      payload: { syscode: appConfig.syscode },
    })
  }

  const init = async () => {
    try {
      setState({
        loading: true,
      })

      // // 如果已经是pathname则不需要一直请求，dev上会无限循环
      // if (this.props.location.pathname === '/system/login') {
      //   return
      // }
      await fetchMenu()
    } catch (error) {
      console.log(123, error)

      message.error(error.msg)
    } finally {
      setState({
        loading: false,
      })
    }
  }

  useEffect(() => {
    mediascreen.current = ResponsiveObserve.subscribe((screens: ScreenMap) => {
      setState({
        screens,
      })
    })
    init()
    return () => {
      mediascreen.current && ResponsiveObserve.unsubscribe(mediascreen.current)
    }
  }, [])

  useEffect(() => {
    // 如果菜单长度大于0,并且当前path为/,则跳转至菜单第一个url
    if (menus?.length > 0 && location.pathname === '/') {
      const url = menus[0] ? deepMenuUrl(menus[0]) : '/'
      history.replace(url)
    }
    updateBreadcrumb()
  }, [location.pathname])

  const onMenuHandle = (path: any) => {
    history.push(path)
    updateBreadcrumb(path)
  }

  // 侧边栏回调
  const onCollapse = (collapsed: boolean, breakpoint: any) => {
    setState({
      collapsed,
      fixedAside: breakpoint && !collapsed,
    })
  }

  const onAsideMaskerClick = (collapsed: boolean, fixedAside: boolean) => {
    setState({
      collapsed,
      fixedAside,
    })
  }

  const renderBreadcrumb = () => {
    const len = breadcrumb && breadcrumb.length
    return (
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        {breadcrumb?.map((item: any, index: number) => {
          return (
            <Breadcrumb.Item key={item.id}>
              {len - 1 === index || !item.url ? (
                <span>{item.name}</span>
              ) : (
                <a
                  onClick={() => {
                    history.push(item.url)
                  }}
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

  const { collapsed, screens, fixedAside } = state

  return (
    <Layout className="auto-wrapper">
      <Aside
        list={menus}
        onMenuHandle={onMenuHandle}
        collapsed={collapsed}
        onCollapse={onCollapse as () => void}
        defaultMenu={location.pathname as string}
        screens={screens}
        fixedAside={fixedAside}
        onMaskerClick={onAsideMaskerClick}
      />
      <Layout>
        <Header breakpoint={!screens.md} collapsed={collapsed} onCollapse={onCollapse} />
        <div className="auto-breadcrumb">{renderBreadcrumb()}</div>
        <Content className="auto-mainbody">{children}</Content>
      </Layout>
    </Layout>
  )
}
export default App
