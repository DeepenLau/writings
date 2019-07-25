import React from 'react'
import PropTypes from 'prop-types'
import './ControlButtons.css'

const ControlButtons = (props) => {
  const { activated, onStart, onPause, onReset, onSplit } = props

  if (activated) {
    return (
      <div>
        <button className="left-btn" onClick={onSplit}>计次</button>
        <button className="right-btn" onClick={onPause}>停止</button>
      </div>
    );
  } else {
    return (
      <div>
        <button className="left-btn" onClick={onReset}>复位</button>
        <button className="right-btn" onClick={onStart}>启动</button>
      </div>
    );
  }
}

ControlButtons.propTypes = {
  activated: PropTypes.bool,
  onStart: PropTypes.func.isRequired,
  onPause: PropTypes.func.isRequired,
  onSplit: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
}
export default ControlButtons