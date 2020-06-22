import { useEffect, FC } from 'react'
import { systemCode } from '../../utils/system'
import { useHistory } from 'react-router-dom'

const RouteChange: FC = () => {
  const history = useHistory()

  const onListenerRoute = (path: string, code: string) => {
    if (systemCode === code) {
      history.push(path)
    } else {
      window.location.href = `/system/${code}${path}`
    }
  }

  useEffect(() => {
    window.AppListenerRouteChange = onListenerRoute
    return () => {
      window.AppListenerRouteChange = null
    }
  }, [])

  return null
}

export default RouteChange
