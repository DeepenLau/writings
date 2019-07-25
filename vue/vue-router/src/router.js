import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '@/views/Home'
import About from '@/views/About'
import AboutChild from '@/views/AboutChild'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'hash',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/about',
      name: 'about',
      component: About,
      children: [
        {
          path: 'aboutchild',
          name: 'aboutchild',
          component: AboutChild,
        }
      ]
    },
  ]
})

console.log(router)

export default router