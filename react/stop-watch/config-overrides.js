// const { injectBabelPlugin } = require('react-app-rewired');

// module.exports = function override(config, env) {
//   config = injectBabelPlugin(['styled-jsx/babel'], config);

//   return config;
// };

const { override, addBabelPlugins } = require('customize-cra')

module.exports = override(
  ...addBabelPlugins('styled-jsx/babel')
)