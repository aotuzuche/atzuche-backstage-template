import React from 'react'
import './style.scss'
import Event from './event'
import { connect } from 'react-redux'

class HomeView extends Event {
  render() {
    return <div>111</div>
  }
}

export default connect(({ home }) => ({
  home,
}))(HomeView)
