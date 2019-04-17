import home from './home'
import services from '../services'
import { getTreeFromFlatData } from '../utils/menuHandles'

const index = {
  namespace: 'index',
  state: {
    menus: null,
    breadcrumb: null
  },
  reducers: {
    set(state, { payload }) {
      return { ...state, ...payload }
    }
  },
  effects: {
    * fetchSystemMenu({ payload }, { call, put }) {
      try {
        const systemMenu = yield call(services.fetchSystemMenu, payload)

        const menus = getTreeFromFlatData({
          flatData: systemMenu.list.map(node => {
            return { ...node }
          }),
          getKey: node => node.id, // resolve a node's key
          getParentKey: node => node.pid // resolve a node's parent's key
        })

        yield put({
          type: 'set',
          payload: {
            menus: menus
          }
        })
      } catch (error) {
        console.log(error)
      }
    }
  }
}

export default [index, home]
