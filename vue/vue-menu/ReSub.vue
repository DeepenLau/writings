<template>
  <SubMenu :key="data.title">
    <template #title>{{ data.title }}</template>
    <template v-for="child of data.children">
      <MenuItem v-if="!data.children" :key="child.title">{{ child.title }}</MenuItem>
      <ReSub v-else :key="child.title" :data="child"></ReSub>
    </template>
  </SubMenu>
</template>

<script>
import SubMenu from './SubMenu'
import MenuItem from './MenuItem'

export default {
  name: 'ReSub',
  components: {
    SubMenu,
    MenuItem
  },
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>

