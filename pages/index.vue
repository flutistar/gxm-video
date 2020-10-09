<template>
  <div class="page">
    <div class="container">
      <Row
        :special-title="'Featured'"
        :large="true"
        :entities-with-data="featuredEntities"
      />
      <Row
        v-if="currentlyWatchingData.length != 0"
        :special-title="'Currently Watching'"
        :entities="currentlyWatchingData"
      />
      <Row
        v-if="favoritesData.length !== 0"
        :special-title="'Favorites'"
        :entities="favoritesData"
      />
      <Row
        v-for="entity in entities"
        :key="entity.id"
        :type="entity.type"
        :collectionID="entity.id"
      />
    </div>
  </div>
</template>

<script>
import Row from '~/components/Row.vue'

export default {
  name: 'HomeView',
  components: { Row },
  transition: 'fade',
  head() {
    return {
      title: 'Watch Exclusive Live Poker Tournaments and TV Shows | PokerGO',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content:
            'Stream the world’s largest collection of live poker tournaments and TV shows like the World Series of Poker (WSOP), Poker After Dark, High Stakes Poker, and more on PokerGO.'
        }
      ]
    }
  },
  data() {
    return {
      featuredEntities: [],
      entities: [],
      currentlyWatching: [],
      favorites: []
    }
  },
  computed: {
    currentlyWatchingData() {
      if (this.currentlyWatching.length === 0) {
        if (this.$store.state.auth.user) {
          return this.$store.state.auth.user.relationships.progress.data
        }
        return []
      }
      return this.currentlyWatching
    },
    favoritesData() {
      if (this.favorites.length === 0) {
        if (this.$store.state.auth.user) {
          return this.$store.state.auth.user.relationships.favorites.data
        }
        return []
      }
      return this.favorites
    },
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
    try {
      await context.app.$axios
        .get(
          '/api/properties/' +
            context.app.store.state.property.property_id +
            '/views/home?include=featured&include=entities'
        )
        .then((resp) => {
          let included = Array.from(
            resp.data.included.filter((val) => {
              for (
                let i = 0;
                i < resp.data.data.relationships.featured.data.length;
                i++
              ) {
                if (
                  resp.data.data.relationships.featured.data[i].id === val.id
                ) {
                  return true
                }
              }
              return false
            })
          )
          let tmp = []
          if (included) {
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

                airDate: included[i].attributes.air_date,
                video_type: included[i].attributes.video_type
              })
            }
          }
          ret.featuredEntities = tmp
          included = resp.data.included.filter((val) => {
            for (
              let i = 0;
              i < resp.data.data.relationships.entities.data.length;
              i++
            ) {
              if (resp.data.data.relationships.entities.data[i].id === val.id) {
                return true
              }
            }
            return false
          })
          tmp = []
          if (included) {
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

                airDate: included[i].attributes.air_date,
                video_type: included[i].attributes.video_type
              })
            }
          }
          ret.entities = tmp
        })
    } catch (err) {
      if (!err.response) {
        context.app.$showError({
          title: 'Error',
          text: err
        })
        return
      }
      context.app.$showError({
        title: err.response.data.errors[0].title,
        text: err.response.data.errors[0].detail
      })
    }
    return ret
  },
  async mounted() {
    if (this.viewData === undefined) {
      this.$nuxt.error({ message: 'View not found' })
    }
    await this.loadViewData()
    try {
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
    if (this.$store.state.auth.user) {
      await this.loadSubscriberData()
    } else {
      window.location.href = process.env.seo_url
    }
  },
  methods: {
    loadSubscriberData() {
      this.$axios
        .get('/api/properties/' + this.property + '/subscribers/me/progress')
        .then((resp) => {
          const tmp = []
          for (let i = 0; i < resp.data.data.length; i++) {
            tmp.push({
              id: resp.data.data[i].id,
              title: resp.data.data[i].attributes.title,
              type: resp.data.data[i].type,
              images: resp.data.data[i].attributes.images,
              entitled: resp.data.data[i].meta.entitled,

              progress:
                100 *
                (resp.data.data[i].meta.progress /
                  resp.data.data[i].attributes.duration),

              airDate: resp.data.data[i].attributes.air_date,
              video_type: resp.data.data[i].attributes.video_type
            })
          }
          this.currentlyWatching = tmp
        })
      this.$axios
        .get('/api/properties/' + this.property + '/subscribers/me/favorites')
        .then((resp) => {
          const tmp = []
          for (let i = 0; i < resp.data.data.length; i++) {
            tmp.push({
              id: resp.data.data[i].id,
              title: resp.data.data[i].attributes.title,
              type: resp.data.data[i].type,
              images: resp.data.data[i].attributes.images,
              entitled: resp.data.data[i].meta.entitled,

              progress:
                100 *
                (resp.data.data[i].meta.progress /
                  resp.data.data[i].attributes.duration),
              airDate: resp.data.data[i].attributes.air_date,
              video_type: resp.data.data[i].attributes.video_type
            })
          }

          this.favorites = tmp
        })
    },
    async loadViewData() {
      await this.$axios
        .get(
          '/api/properties/' +
            this.property +
            '/views/' +
            this.viewData.name +
            '?include=featured,entities'
        )
        .then((resp) => {
          let included = Array.from(
            resp.data.included.filter((val) => {
              for (
                let i = 0;
                i < resp.data.data.relationships.featured.data.length;
                i++
              ) {
                if (
                  resp.data.data.relationships.featured.data[i].id === val.id
                ) {
                  return true
                }
              }
              return false
            })
          )
          let tmp = []
          if (included) {
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
                airDate: included[i].attributes.air_date,
                video_type: included[i].attributes.video_type
              })
            }
          }
          this.featuredEntities = tmp
          included = resp.data.included.filter((val) => {
            for (
              let i = 0;
              i < resp.data.data.relationships.entities.data.length;
              i++
            ) {
              if (resp.data.data.relationships.entities.data[i].id === val.id) {
                return true
              }
            }
            return false
          })
          tmp = []
          if (included) {
            for (let i = 0; i < included.length; i++) {
              tmp.push({
                id: included[i].id,
                title: included[i].attributes.title,
                type: included[i].type,
                images: included[i].attributes.images,
                progress:
                  100 *
                  (included[i].meta.progress / included[i].attributes.duration),
                airDate: included[i].attributes.air_date,
                video_type: included[i].attributes.video_type
              })
            }
          }
          this.entities = tmp
        })
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
