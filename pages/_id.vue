<template>
  <div class="page">
    <div v-if="rows != undefined" class="container">
      <Row
        v-for="entity in rows"
        :key="entity.id"
        :type="entity.type"
        :special-title="entity.title"
        :collectionID="entity.id"
        :entities="entity.entities"
      />
    </div>
  </div>
</template>

<script>
import Row from '~/components/Row.vue'

export default {
  name: 'DefaultViewLayout',
  head() {
    return {
      title: 'Poker Video Highlights | PokerGO',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content:
            'Browse poker video highlights of the biggest live events and tv shows in the world like the WSOP, High Stakes Poker, Poker After Dark, and more.'
        }
      ]
    }
  },
  components: { Row },
  data() {
    return {
      featuredEntities: [],
      entities: [],
      rows: undefined
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
        entities: [],
        rows: []
      }
    }
    const ret = {
      featuredEntities: [],
      entities: [],
      rows: []
    }
    let viewName = 'highlights'
    let found = false
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
        if (context.store.state.property.default_views[i].requestViewName) {
          viewName =
            context.store.state.property.default_views[i].requestViewName
          found = true
        }
      }
    }
    if (!found) {
      context.res.statusCode = 404
    }
    try {
      // Request all entities within collections and populate a data structure
      await context.app.$axios
        .get(
          '/api/properties/' +
            context.app.store.state.property.property_id +
            '/views/' +
            viewName +
            '?include=featured,entities'
        )
        .then((resp) => {
          ret.featuredEntities = resp.data.data.relationships.featured.data
          ret.entities = resp.data.data.relationships.entities.data
          const tmp = []
          const included = resp.data.included
          for (let i = 0; i < included.length; i++) {
            tmp.push({
              id: included[i].id,
              title: included[i].attributes.title,
              type: included[i].type,
              entitled: included[i].meta.entitled,
              progress:
                100 *
                (included[i].meta.progress / included[i].attributes.duration),
              airDate: included[i].airDate,
              video_type: included[i].video_type,
              entities: included[i].relationships.entities.data
            })
          }
          ret.entities = tmp
          ret.rows = tmp
        })
    } catch (err) {}
    return ret
  },
  async mounted() {
    if (this.viewData === undefined) {
      this.$nuxt.error({ statusCode: 404, message: 'View not found' })
      return
    }
    if (this.rows.length !== 0) {
      return
    }
    try {
      let name = this.viewData.name
      if (this.viewData.requestViewName) {
        name = this.viewData.requestViewName
      }
      await this.$axios
        .get(
          '/api/properties/' +
            this.property +
            '/views/' +
            name +
            '?include=featured,entities'
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
              video_type: included[i].video_type,
              entities: included[i].relationships.entities.data
            })
          }
          this.entities = tmp
          this.rows = this.entities
        })
    } catch (err) {
      await this.$nuxt.error({
        statusCode: 404,
        message: 'Page does not exist'
      })
      if (!err.response) {
        if (!err.response) {
          this.$showError({
            title: 'Error',
            text: err
          })
          return
        }
      }
      if (err.response && err.response.status === 401) {
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
