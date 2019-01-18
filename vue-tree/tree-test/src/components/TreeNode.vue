<template>
  <div>
    <div style="cursor:pointer" :style="indent" @click="toggle">
      <div>{{ node.label }}</div>
    </div>
    <template v-if="showChildren">
      <TreeNode v-for="child in node.children" :key="child.key" :node="child"></TreeNode>
    </template>
  </div>
</template>

<script>
export default {
  name: 'TreeNode',
  props: ['node'],
  data() {
    return {
      showChildren: false
    }
  },
  computed: {
    indent() {
      return `transform: translate(${(this.node.depth - 1)*50}px)`
    }
  },
  methods: {
    toggle() {
      this.showChildren = !this.showChildren
    }
  }
}
</script>

