import qs from 'qs'
import { withRouter } from 'react-router-dom'

const TOOL = Comp => {
  class TOOLComponent extends Comp {
    get search() {
      return this.props.location
        ? qs.parse(this.props.location.search.replace(/^\?/, ''))
        : {}
    }

    get params() {
      return this.props.match ? this.props.match.params : {}
    }

    render() {
      return super.render(this.props, this.state)
    }
  }
  return withRouter(TOOLComponent)
}

export default TOOL
