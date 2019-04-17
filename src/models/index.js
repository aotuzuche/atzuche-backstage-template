import home from './home'
import services from '../services'

const index = {
  namespace: 'index',
  state: {
    menus: null
  },
  reducers: {
    set(state, { payload }) {
      return { ...state, ...payload }
    }
  },
  effects: {
    * fetchSystemMenu({ payload }, { call, put }) {
      console.log('payload', payload)
      try {
        const systemMenu = yield call(services.fetchSystemMenu, payload)

        yield put({
          type: 'set',
          payload: {
            menus: systemMenu && systemMenu.list ? systemMenu.list : []
          }
        })
      } catch (error) {
        console.log(error)
      }
    }
  }
}

export default [index, home]
