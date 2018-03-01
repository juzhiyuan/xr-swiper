import React from 'react'
import {render} from 'react-dom'
import Swiper from '../../src'
import './index.css'

class App extends React.Component {
  componentDidMount() {
    this.next()
  }

  next = () => {
  }

  render() {
    return (
      <Swiper
        className="Swiper"
        startIndex={2}
        ref={el => { this.swiper = el }}
      >
        <div>container 1</div>
        <div>container 2</div>
        <div>container 3</div>
      </Swiper>
    )
  }
}

render(<App />, document.getElementById('root'))
