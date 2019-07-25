<template>
  <Menu>
    <template v-for="item of menu">
      <MenuItem :key="item.title" v-if="!(item.children && item.children.length)">{{ item.title }}</MenuItem>
      <ReSub v-else :key="item.title" :data="item"></ReSub>
    </template>

  </Menu>
</template>

<script>
import Menu from './Menu'
import MenuItem from './MenuItem'
import SubMenu from './SubMenu'
import ReSub from './ReSub'
export default {
  components: {
    Menu,
    MenuItem,
    SubMenu,
    ReSub
  },
  data () {
    return {
      menu: [
        { title: 1 },
        { title: 2 },
        {
          title: 3,
          children: [
            { title: '3-1' },
            { title: '3-2' }
          ]
        },
        {
          title: 4,
          children: [
            { title: '4-1' },
            { title: '4-2' },
            {
              title: '4-3',
              children: [
                { title: '4-3-1' },
                { title: '4-3-2' },
                {
                  title: '4-3-3',
                  children: [
                    { title: '4-3-3-1' },
                    { title: '4-3-3-2' },
                    { title: '4-3-3-3' },
                    { title: '4-3-3-4' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  }
}
</script>
