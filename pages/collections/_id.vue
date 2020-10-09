<template>
  <div class="page">
    <div class="collection-container">
      <div class="header">
        <div class="header-img">
          <img :src="hdImage" />
        </div>
        <div class="header-text">
          <div class="body-header">
            <h3 class="body-title">{{ title }}</h3>
            <button @click="setFavorite" v-if="loggedIn" class="button">
              <font-awesome-icon icon="star" />
              {{ favorite ? 'remove' : 'Favorite' }}
            </button>
          </div>
          <p class="description">
            {{ description }}
          </p>
        </div>
      </div>
      <div class="container">
        <Row
          v-for="(entity, idx) in entities"
          :key="idx + entity"
          :collectionID="entity.id"
          :type="entity.type"
          class="row-with-margin"
        />
      </div>
    </div>
  </div>
</template>
<script>
import Row from '~/components/Row.vue'

export default {
  name: 'CollectionDetailView',
  components: { Row },
  data() {
    return {
      title: '',
      description: '',
      airDate: '',
      end_date: '',
      type: '',
      publish_date: '',
      entities: [],
      images: [],
      favorite: false
    }
  },
  computed: {
    routeId() {
      return this.$route.params.id
    },
    hdImage() {
      for (let i = 0; i < this.images.length; i++) {
        if (this.images[i].label === 'HD') {
          return this.images[i].url
        }
      }
      return ''
    },
    property() {
      return this.$store.state.property.property_id
    },
    loggedIn() {
      return this.$store.state.auth.user
    }
  },
  mounted() {
    this.$axios
      .get(`/api/properties/` + this.property + `/collections/` + this.routeId)
      .then((res) => {
        const date = new Date(res.data.data.attributes.publish_date)

        this.title = res.data.data.attributes.title
        this.description = res.data.data.attributes.description
        this.type = res.data.data.attributes.collection_type
        this.entities = res.data.data.relationships.entities.data
        this.images = res.data.data.attributes.images
        this.favorite = res.data.data.meta.favorite
        this.publish_date =
          date.getMonth() + 1 + '-' + date.getDate() + '-' + date.getFullYear()
      })
      .catch((err) => {
        if (err) {
          this.$nuxt.error({ message: 'Collection not found', status: 404 })
        }
      })
  },
  methods: {
    setFavorite() {
      if (!this.favorite) {
        this.$axios
          .post(
            `/api/properties/` +
              this.property +
              `/subscribers/me/favorites/collections`,
            { data: { id: this.routeId, type: 'video' } },
            { headers: { 'Content-Type': 'application/vnd.api+json' } }
          )
          .then(() => {
            this.favorite = true
          })
      } else {
        this.$axios
          .delete(
            `/api/properties/` +
              this.property +
              `/subscribers/me/favorites/collections/` +
              this.routeId
          )
          .then(() => {
            this.favorite = false
          })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.collection-container {
  display: flex;
  flex-flow: column;
  width: 100%;
  max-width: 1000px;

  .header {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-around;
    width: 100%;
    padding: 20px;
    overflow-y: hidden;

    .header-img {
      top: 0;
      left: 0;
      z-index: -2;
      width: 100%;
      height: 100%;

      img {
        width: 100%;
        height: auto;
      }
    }

    .header-text {
      width: 100%;
    }
  }
}
.container {
  padding: 20px;
}

.button {
  float: right;
}

.page {
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.description {
  font-size: 16px;
}

.row-with-margin {
  margin-top: 20px;
  margin-bottom: 20px;
  /deep/ .title {
    margin-bottom: 3px !important;
  }
}

.body-header {
  display: flex;
  flex-flow: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 10px;
  margin-bottom: 10px;

  .body-title {
    margin-top: 0;
    margin-bottom: 0;
    font-size: 40px;
    font-style: italic;
    font-weight: bold;
    text-transform: uppercase;
  }
}
</style>
