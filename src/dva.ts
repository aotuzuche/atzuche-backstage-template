import { create } from 'dva-core'

let app: any
let store: any
let dispatch

function createApp(opt: any) {
  app = create(opt)

  if (!global.registered) {
    opt.models.forEach((model: any) => app.model(model))
  }
  global.registered = true

  app.start()

  store = app._store
  app.getStore = () => store

  dispatch = store.dispatch

  app.dispatch = dispatch
  return app
}

export default {
  createApp,
  getDispatch() {
    return app.dispatch
  },
}
