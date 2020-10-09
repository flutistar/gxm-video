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
  name: 'FrequentlyAskedQuestions',
  head() {
    return {
      title: 'Frequently Asked Questions | PokerGO',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content:
            'Browse our FAQ to find answers to all of your PokerGO questions. Learn more about troubleshooting problems and how to contact our customer service team.'
        }
      ]
    }
  },
  computed: {
    document() {
      const document = this.$store.state.property.documents.filter(
        (item) => item.label === 'faq'
      )
      if (document.length > 0) {
        return document[0]
      } else {
        return {
          id: 'faq',
          label: 'Frequently Asked Questions',
          content: ''
        }
      }
    }
  },
  async beforeMount() {
    await this.$store.dispatch('property/getDocument', 'faq')
  }
}
</script>

<style lang="scss">
.narrow-text-container {
  width: 100%;
  max-width: 800px;
}
</style>
