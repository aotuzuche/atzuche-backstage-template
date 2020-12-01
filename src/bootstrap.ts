import appConfig from '../appConfig'
if (process.env.NODE_ENV === 'development') {
  window.SYSCODE = appConfig.syscode
}
// @ts-ignore
import('layout/bootstrap')
