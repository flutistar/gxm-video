<template>
  <div class="container" style="padding: 50px">
    <h1 v-if="error.statusCode === 404">
      {{ error.statusCode }}: {{ error.message }}
    </h1>
    <h1 v-else>{{ error.statusCode }}: An error occurred</h1>
    <nuxt-link to="/">Home Page</nuxt-link>
  </div>
</template>
<script lang="js">
import Vue from 'vue'

export default Vue.extend({
  name: 'Error',
  head() {
    return {
      title: 'Page Not Found | PokerGO',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content:
            'Page not found.'
        }
      ]
    }
  },
  components: { },
  props: {
    error: {
      type: Object,
      default: null
    },
  },
  asyncData(context){
    // console.log(context)
  }
})
</script>
<style>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}
</style>
