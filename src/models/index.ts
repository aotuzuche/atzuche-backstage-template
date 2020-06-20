import home from './home'
import services from '../services'
import { getTreeFromFlatData } from 'at-console-components/lib/utils/menuHandles'
import { Model } from 'dva'

const index: Model = {
  namespace: 'index',
  state: {
    menus: null,
    breadcrumb: null,
  },
  reducers: {
    set(state: any, { payload }) {
      return { ...state, ...payload }
    },
  },
  effects: {
    *fetchSystemMenu({ payload }, { call, put }) {
      try {
        const systemMenu = yield call(services.fetchSystemMenu, payload)

        const menus = getTreeFromFlatData({
          flatData: systemMenu.list.map((node: any) => {
            return { ...node }
          }),
          getKey: (node: any) => node.id, // resolve a node's key
          getParentKey: (node: any) => node.pid, // resolve a node's parent's key
        })

        yield put({
          type: 'set',
          payload: {
            menus: menus,
          },
        })
      } catch (error) {
        Promise.reject(error)
      }
    },
  },
}

export default [index, home]
