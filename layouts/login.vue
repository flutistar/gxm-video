<template>
  <div class="login-page">
    <Header :nav="false" />
    <div class="columns">
      <div v-if="loginText !== ''" class="column size-4 centered">
        <div class="container centered" style="margin-top: 20px;">
          <div v-if="showLogo" class="logo-container">
            <img src="~/assets/images/logo.png" />
          </div>
          <p>
            {{ loginText }}
          </p>
        </div>
      </div>
      <div class="column size-4 centered">
        <nuxt />
        <notifications group="messages" position="bottom right" />
      </div>
    </div>
  </div>
</template>
<script lang="js">
import Vue from 'vue'
import Header from '../components/Header.vue'

export default Vue.extend({
  name: 'LoginLayout',
  components: { Header },
  computed: {
    loginText() {
      return this.$store.state.property.loginPageText
    },
    showLogo() {
      return this.$store.state.property.showLoginLogo
    }
  }
})
</script>
<style lang="scss" scoped>
.columns {
  display: flex;
  flex-flow: column;
}
.container {
  &.centered {
    justify-content: centered;
  }
}
.column {
  display: flex;
  flex: 5;
  justify-content: center;
  $sizes: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10;

  @each $size in $sizes {
    &.size-#{$size} {
      flex: $size;
    }
  }
}
.logo-container {
  width: 200px;
  margin-bottom: 20px;
  img {
    width: 100%;
  }
}
</style>
