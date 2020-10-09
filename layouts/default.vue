<template>
  <div style="height:100%;">
    <Header />
    <nuxt />
    <Footer />
    <notifications group="messages" position="bottom right" />
    <login-modal v-if="modalVisible" @no="removeModal" />
  </div>
</template>
<script lang="js">
import Vue from 'vue'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import LoginModal from '../components/LoginModal.vue'

export default Vue.extend({
  name: 'DefaultLayout',
  components: { Header, Footer, LoginModal },
  data(){
    return {
      hideModal: false
    }
  },
  computed: {
    modalVisible(){
      return (this.$route.query.login === 'show' && !this.$store.state.auth.user)
    }
  },
  watch:{
    '$store.state.auth.user'(){
      // We need to reload the page data with the logged in data
    }
  },
  mounted() {
    this.$store.dispatch('property/onInitSession')
  },
  methods: {
    removeModal() {
      this.$router.push({ path: this.$route.path, query: {} })
    }
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
