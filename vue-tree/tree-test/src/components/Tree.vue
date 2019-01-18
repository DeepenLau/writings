<template>
  <div class="tree-menu">
    <TreeNode v-for="child in list" :key="child.key" :node="child"></TreeNode>
  </div>
</template>

<script>
import TreeNode from './TreeNode.vue'
let count = 1

function setKey(list) {
  return list.map(node => {
    node.key = count++
    if (node.children && node.children.length) {
      setKey(node.children)
    }
    return node
  })
}

let depth = 1

function setDepth(list) {
  const queryQueue = []
  queryQueue.push(...list)

  for (let i = 0; i < queryQueue.length; i++) {
    let currentItem = queryQueue[i]
    if (currentItem.parent) {
      currentItem.depth = currentItem.parent.depth + 1
    } else {
      currentItem.depth = depth
    }
    if (currentItem.children) {
      let children = []
      for (let j = 0; j < currentItem.children.length; j++) {
        currentItem.children[j].parent = currentItem
        children.push(currentItem.children[j])
      }
      queryQueue.push(...children)
    }
  }

  return list
}

export default {
  name: "tree",
  components: {
    TreeNode
  },
  props: ['data'],
  data() {
    return {
      depth: 0,
      showChildren: false,
      list: []
    }
  },
  created() {
    this.list = setDepth(setKey(this.data))
  },
  computed: {
    indent() {
      return `transform: translate(${this.depth*50}px)`
    }
  },
  methods: {
    toggleChildren() {
      this.showChildren = !this.showChildren
    }
  }
};
</script>

