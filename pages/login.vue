<template>
  <div class="" style="width: 100%;"></div>
</template>

<script>
export default {
  name: 'LoginView',
  layout: 'login',

  mounted() {
    this.$router.push('/?login=show')
  }
}
</script>
