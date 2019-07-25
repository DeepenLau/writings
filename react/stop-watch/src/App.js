import React, { Component, Fragment } from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import './App.css';
import StopWatch from './components/StopWatch.jsx'
import RandomJoke from './components/RandomJoke.jsx'
import Tabs from './components/tab/Tabs.jsx'
import TabItem from './components/tab/TabItem.jsx'
// import CounterView from './components/CounterView.jsx'

// const store = createStore()

class App extends Component {
  state = {
    count: 1
  }
  render() {
    return (
      <Fragment>
        <StopWatch />
        <RandomJoke />
        {/* <CounterView /> */}
        <Tabs>
          <TabItem>1</TabItem>
          <TabItem>2</TabItem>
          <TabItem>3</TabItem>
        </Tabs>
      </Fragment>
    )
  }
}

export default App
