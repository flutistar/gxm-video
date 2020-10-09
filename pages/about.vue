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
  name: 'AboutPokerGo',
  head() {
    return {
      title: 'About and Overview | PokerGO',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content:
            'PokerGO is the exclusive home of the biggest live poker events and TV shows in the world. Learn more about our video streaming service and original content.'
        }
      ]
    }
  },
  computed: {
    document() {
      const document = this.$store.state.property.documents.filter(
        (item) => item.label === 'about'
      )
      if (document.length > 0) {
        return document[0]
      } else {
        return {
          label: 'About',
          content: ''
        }
      }
    }
  },
  async beforeMount() {
    await this.$store.dispatch('property/getDocument', 'about')
  }
}
</script>

<style lang="scss">
.narrow-text-container {
  width: 100%;
  max-width: 800px;
}
</style>
