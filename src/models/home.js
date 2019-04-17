export default {
  namespace: 'home',
  state: [],
  reducers: {
    set(state, { payload }) {
      return { ...state, ...payload }
    }
  }
}
