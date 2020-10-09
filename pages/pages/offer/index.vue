<template>
  <div>
    <nuxt-link to="/">Home Page</nuxt-link>
  </div>
</template>

<script>
export default {
  name: 'Offer',
  mounted() {
    // eslint-disable-next-line nuxt/no-env-in-hooks
    if (process.client) {
      window.location.replace(process.env.seo_url)
    }
  }
}
</script>
