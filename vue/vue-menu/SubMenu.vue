<template>
  <li>
    <div @click="flag=!flag">
      <slot name="title"></slot>
    </div>
    <ul class="sub-menu" v-if="flag">
      <slot></slot>
    </ul>
  </li>
</template>

<script>
export default {
  data () {
    return {
      flag: true
    }
  },
  methods: {}
}
</script>


<style>
  .sub-menu {
    padding-left: 20px
  }
</style>
