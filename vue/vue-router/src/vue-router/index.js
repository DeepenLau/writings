class HistoryRoute {
  constructor() {
    this.current = null
  }
}

class VueRouter {
  constructor(options) {
    this.mode = options.mode || 'hash'
    this.routes = options.routes || []
    this.routesMap = this.createMap(this.routes)
    this.history = new HistoryRoute()
    this.init()
  }

  init() {
    if (this.mode === 'hash') {
      location.hash ? '' : location.hash = '/'
      window.addEventListener('load', () => {
        this.history.current = location.hash.slice(1)
      })
      window.addEventListener('hashchange', () => {
        this.history.current = location.hash.slice(1)
      })
    } else {
      location.pathname ? '' : location.pathname = '/'
      window.addEventListener('load', () => {
        this.history.current = location.pathname
      })
      window.addEventListener('popstate', () => {
        this.history.current = location.pathname
      })
    }
  }

  createMap(routes) {
    return routes.reduce((prev, current) => {
      prev[current.path] = current.component
      return prev
    }, {})
  }
}

VueRouter.install = Vue => {
  Vue.mixin({
    beforeCreate() {
      if (this.$options && this.$options.router) {
        // 根组件
        this._root = this
        this._router = this.$options.router
        Vue.util.defineReactive(this, 'xxx', this._router.history)
      } else {
        // 子组件可以拿到唯一的根组件的 _router 实例
        this._root = this.$parent._root
        this._router = this._root._router
      }
      Object.defineProperty(this, '$router', {
        get() {
          return this._root.router
        }
      })
      Object.defineProperty(this, '$route', {
        get() {
          return {
            current: this._root._router.history.current
          }
        }
      })
    }
  })
  Vue.component('router-link', {
    props: {
      to: String,
      tag: String
    },
    methods: {
      handleClick(e) {
        e.preventDefault()
        console.log(111111)
      }
    },
    render(h) {
      const mode = this._self._root._router.mode
      const Tag = this.tag || 'a'
      return <Tag on-click={this.handleClick} href={mode === 'hash' ? `#${this.to}` : this.to}>{this.$slots.default}</Tag>
    }
  })
  Vue.component('router-view', {
    render(h) {
      let current = this._self._root._router.history.current
      let routesMap = this._self._root._router.routesMap
      return h(routesMap[current])
    }
  })
}

export default VueRouter