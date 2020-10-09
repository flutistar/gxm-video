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
  name: 'TermsAndConditions',
  head() {
    return {
      title: 'Terms and Conditions | PokerGO',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content:
            'The PokerGO terms of conditions govern your usage of our websites, mobile websites, apps, video services, and more.'
        }
      ]
    }
  },
  computed: {
    document() {
      const document = this.$store.state.property.documents.filter(
        (item) => item.label === 'terms-and-conditions'
      )
      if (document.length > 0) {
        return document[0]
      } else {
        return {
          id: 'terms-and-conditions',
          label: 'Terms and Conditions',
          content: ''
        }
      }
    }
  },
  async beforeMount() {
    await this.$store.dispatch('property/getDocument', 'terms-and-conditions')
  }
}
</script>

<style lang="scss">
.narrow-text-container {
  width: 100%;
  max-width: 800px;
}
</style>
