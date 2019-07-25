import React from 'react'
import PropTypes from 'prop-types'
import MajorClock from './MajorClock'

const SplitTimes = ({value = []}) => {
  //TODO: 返回所有计次时间的JSX
  return value.map((v, k) => (
    <MajorClock key={k} milliseconds={v}/>
  ))
}

SplitTimes.propTypes = {
  splits: PropTypes.arrayOf(PropTypes.number)
}

export default SplitTimes