import React from 'react'

// class Joke extends React.PureComponent {
//   render () {
//     return (
//       <div>
//         {this.props.value || 'loading...'}
//       </div>
//     )
//   }
// }

const Joke = React.memo((props) => (
  <div>
    {props.value || 'loading...'}
  </div>
))

export default Joke