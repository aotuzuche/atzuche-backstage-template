// GLobal types
declare global {
  namespace NodeJS {
    interface Global {
      registered: boolean
    }
  }
  interface Window {
    AppListenerRouteChange: any
  }
}

export {}
