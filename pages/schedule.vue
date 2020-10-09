<template>
  <div class="page">
    <div class="container">
      <Row
        v-if="featuredEntities.length !== 0"
        :special-title="'Featured'"
        :large="true"
        :entities-with-data="featuredEntities"
      />
      <LongCard
        v-for="entity in entities"
        :key="entity.id"
        :entity-type="entity.type"
        :entity-id="entity.id"
      />
    </div>
  </div>
</template>

<script>
import LongCard from '~/components/LongCard.vue'
import Row from '~/components/Row.vue'

export default {
  name: 'LiveView',
  head() {
    return {
      title: 'Live Poker Events Schedule | PokerGO',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content:
            'Watch over 100+ days of live poker tournaments and cash games a year exclusively on PokerGO like Poker Masters, U.S. Poker Open, Super High Roller Bowl series, and more.'
        }
      ]
    }
  },
  components: { LongCard, Row },
  data() {
    return {
      featuredEntities: [],
      entities: [],
      featuredSection: []
    }
  },
  computed: {
    viewData() {
      for (
        let i = 0;
        i < this.$store.state.property.default_views.length;
        i++
      ) {
        if (
          this.$store.state.property.default_views[i].route === this.$route.path
        ) {
          return this.$store.state.property.default_views[i]
        }
      }
      return undefined
    },
    property() {
      return this.$store.state.property.property_id
    }
  },
  async asyncData(context) {
    if (!context.app.store.state.auth.loggedIn) {
      return {
        featuredEntities: [],
        entities: []
      }
    }
    const ret = {
      featuredEntities: [],
      entities: []
    }
    let viewName = ''
    for (
      let i = 0;
      i < context.store.state.property.default_views.length;
      i++
    ) {
      if (
        context.store.state.property.default_views[i].route ===
        context.route.path
      ) {
        viewName = context.store.state.property.default_views[i].name
      }
    }
    try {
      await context.app.$axios
        .get(
          '/api/properties/' +
            context.app.store.state.property.property_id +
            '/views/' +
            viewName +
            '?include=featured&include=main'
        )
        .then((resp) => {
          ret.featuredEntities = resp.data.data.relationships.featured.data
          ret.entities = resp.data.data.relationships.entities.data
        })
    } catch (err) {}
    return ret
  },
  async mounted() {
    if (this.viewData === undefined) {
      this.$nuxt.error({ message: 'View not found' })
    }
    try {
      await this.$axios
        .get(
          '/api/properties/' +
            this.property +
            '/views/' +
            this.viewData.name +
            '?include=featured&include=main'
        )
        .then((resp) => {
          this.featuredEntities = resp.data.data.relationships.featured.data
          this.entities = resp.data.data.relationships.entities.data
        })
    } catch (err) {
      if (!err.response) {
        this.$showError({
          title: 'Error',
          text: err
        })
        return
      }
      if (err.response.status === 401) {
        this.$router.push('/checkout')
      }
    }
  }
}
</script>
<style scoped>
.container {
  height: 100%;
  padding: 20px;
}
</style>
