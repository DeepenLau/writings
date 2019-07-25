import React, { Component, Fragment } from 'react';
import ControlButtons from './ControlButtons.jsx'
import MajorClock from './MajorClock.jsx'
import SplitTimes from './SplitTimes.jsx'
import CounterView from './CounterView.jsx'

class StopWatch extends Component {
  state = {
    isStarted: false,
    startTime: null,
    currentTime: null,
    splits: [],
  }

  onSplit = () => {
    this.setState({
      splits: [...this.state.splits, this.state.currentTime - this.state.startTime]
    })
  }

  onStart = () => {
    this.setState({
      isStarted: true,
      startTime: new Date(),
      currentTime: new Date(),
    });

    this.intervalHandle = setInterval(() => {
      this.setState({ currentTime: new Date() });
    }, 1000 / 60);
  }

  onPause = () => {
    clearInterval(this.intervalHandle);
    this.setState({
      isStarted: false,
    });
  }

  onReset = () => {
    this.setState({
      startTime: null,
      currentTime: null,
      splits: [],
    });
  }

  render() {
    const { currentTime, startTime, splits, isStarted } = this.state

    return (
      <Fragment>
        <style jsx>{`
          h1 {
            color: green;
          }
        `}</style>

        <h1>秒表</h1>
        <MajorClock
          milliseconds={currentTime - startTime}
          activated={isStarted}/>
        <ControlButtons
          activated={isStarted}
          onSplit={this.onSplit}
          onStart={this.onStart}
          onPause={this.onPause}
          onReset={this.onReset}/>
        <SplitTimes value={splits}/>
        <CounterView/>
      </Fragment>
    )
  }
}

export default StopWatch
