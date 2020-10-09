<template>
  <div class="page">
    <div class="container">
      <small-card
        v-for="entity in entities"
        :key="entity.id"
        :entity-id="entity.id"
        :entity-type="entity.type"
        :entity-data="entity"
        :show-title="false"
        :no-reload="true"
        style="margin-bottom: 20px;"
      />
    </div>
  </div>
</template>

<script>
import SmallCard from '~/components/SmallCard.vue'

export default {
  name: 'ShowsView',
  head() {
    return {
      title:
        'On Demand Poker Events, TV Shows and Original Programming | PokerGO',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content:
            'Stream over 2,000 poker videos of the biggest live events, tv shows, and original programming in the world. Watch poker anytime, anywhere.'
        }
      ]
    }
  },
  components: { SmallCard },
  data() {
    return {
      featuredEntities: [],
      entities: []
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
            '?include=featured&include=entities'
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
            '?include=entities&include=featured'
        )
        .then((resp) => {
          this.featuredEntities = resp.data.data.relationships.featured.data
          const tmp = []
          const included = resp.data.included
          for (let i = 0; i < included.length; i++) {
            tmp.push({
              id: included[i].id,
              title: included[i].attributes.title,
              type: included[i].type,
              images: included[i].attributes.images,
              entitled: included[i].meta.entitled,
              progress:
                100 *
                (included[i].meta.progress / included[i].attributes.duration),
              airDate: included[i].airDate,
              video_type: included[i].video_type
            })
          }
          this.entities = tmp
        })
      this.$forceUpdate()
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
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  height: 100%;
  padding: 20px;
}
</style>
