import React, { useState, useEffect } from 'react'

const CounterView = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    document.title = `Count: ${count}`
  })

  return (
    <div>
      <div>{count}</div>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  )
}

export default CounterView