// GLobal types
declare global {
  namespace NodeJS {
    interface Global {
      registered: boolean
    }
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production'
      PACKAGE: 'development' | 'production' | 'test'
    }
  }
  interface Window {
    AppListenerRouteChange: any
    SYSCODE: string
  }
}

export {}
