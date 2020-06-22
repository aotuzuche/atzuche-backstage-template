import { Model } from 'dva'

const home: Model = {
  namespace: 'home',
  state: [],
  reducers: {
    set(state, { payload }) {
      return { ...state, ...payload }
    },
  },
}

export default home
