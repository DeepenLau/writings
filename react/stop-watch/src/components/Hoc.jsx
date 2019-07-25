import React from 'react'

const getUserId = () => true

const LogoutButton = () => {
  return '退出登录'
}

const ShoppintCart = () => {
  return '购物车'
}

const withLogin = (Component) => {
  const NewComponent = (props) => {
    if (getUserId()) {
      return <Component {...props} />
    } else {
      return null
    }
  }
  return NewComponent
}

withLogin(LogoutButton)
withLogin(ShoppintCart)

const withDoNothing = (Component) => {
  const NewComponent = (props) => {
    return <Component {...props} />;
  };
  return NewComponent;
};

export default withDoNothing