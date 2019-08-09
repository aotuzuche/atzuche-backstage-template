import dva from './dva'
import models from './models/index'

const dvaApp = dva.createApp({
  initialState: {},
  models,
})
const store = dvaApp.getStore()

export default store
