import React from 'react'
import { systemCode } from '../../utils/system'
class RouteChange extends React.PureComponent {
  componentDidMount() {
    window.AppListenerRouteChange = this.onListenerRoute.bind(this)
  }

  componentWillUnmount() {
    window.AppListenerRouteChange = null
  }

  onListenerRoute(path, code) {
    if (systemCode === code) {
      this.props.history.push(path)
    } else {
      window.location.href = `/system/${code}${path}`
    }
  }

  render() {
    return null
  }
}

export default RouteChange
