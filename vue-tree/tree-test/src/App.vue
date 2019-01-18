<template>
  <div id="app">
    <Tree :data="data"></Tree>
    <el-tree :data="data"></el-tree>
  </div>
</template>

<script>
import Tree from "./components/Tree.vue";

export default {
  name: "app",
  components: {
    Tree
  },
  data() {
    return {
      data: [
        {
          label: "一级 1",
          children: [
            {
              label: "二级 1",
              children: [
                {
                  label: "三级 1"
                }
              ]
            },
            {
              label: "二级 2"
            }
          ]
        },
        {
          label: "一级 2",
          children: [
            {
              label: "二级 1"
            },
            {
              label: "二级 2"
            },
            {
              label: "二级 3"
            }
          ]
        }
      ]
    };
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
