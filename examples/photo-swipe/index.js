import React from 'react'
import {render} from 'react-dom'
import Swiper, {PinchableImage} from '../../src'
import './index.css'

class App extends React.Component {
  state = {
    empty: false,
  }

  componentDidMount() {
    this.next()
  }

  next = () => {
  }

  handleClose = () => {
    this.setState({
      empty: true,
    })
  }

  render() {
    if (this.state.empty) {
      return (
        <div>empty</div>
      )
    }
    return (
      <Swiper
        className="Swiper"
        startIndex={2}
        ref={el => { this.swiper = el }}
        onClose={this.handleClose}
      >
        <PinchableImage src="./imgs/1.jpg" />
        <PinchableImage src="./imgs/2.jpg" />
        <PinchableImage src="./imgs/3.jpg" />
      </Swiper>
    )
  }
}

render(<App />, document.getElementById('root'))
