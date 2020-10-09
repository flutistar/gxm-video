<template>
  <div class="page">
    <div class="container centered">
      <div class="narrow-text-container">
        <div v-html="document.content"></div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'PrivacyPolicy',
  head() {
    return {
      title: 'Privacy Policy | PokerGO',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content:
            'PokerGO cares about your privacy. View our privacy policy to understand how, why, and what data we collect.'
        }
      ]
    }
  },
  computed: {
    document() {
      const document = this.$store.state.property.documents.filter(
        (item) => item.label === 'privacy-policy'
      )
      if (document.length > 0) {
        return document[0]
      } else {
        return {
          id: 'privacy-policy',
          label: 'Privacy Policy',
          content: ''
        }
      }
    }
  },
  async beforeMount() {
    await this.$store.dispatch('property/getDocument', 'privacy-policy')
  }
}
</script>

<style lang="scss">
.narrow-text-container {
  width: 100%;
  max-width: 800px;
}
</style>
