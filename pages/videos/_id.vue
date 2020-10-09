<template>
  <div class="page">
    <div class="container centered">
      <div class="player-container">
        <video-player
          :overlay-image="overlayImage"
          :id="routeId"
          :property="property"
          :autoplay="true"
          @streamEnded="streamLive = false"
          @streamStarted="streamLive = true"
        />
      </div>
      <div class="video-info">
        <div class="body-header">
          <h3 class="body-title">{{ title }}</h3>
          <div class="button-container">
            <button @click="setFavorite" v-if="loggedIn" class="button">
              <font-awesome-icon icon="star" />
              {{ favorite ? 'remove' : 'Favorite' }}
            </button>
          </div>
        </div>
        <!-- <p v-if="type !== 'live'">Published {{ publish_date }}</p>
        <p v-if="type === 'live' && streamLive">Live</p>
        <p v-if="type === 'live' && streamUpcoming">
          Stream Starts: {{ air_date }}
        </p>
        <p v-if="type === 'live' && streamEnded">
          Stream Ended: {{ end_date }}
        </p>-->
        <p>{{ description }}</p>
      </div>
    </div>
    <are-you-sure
      v-if="!entitled"
      :to="'/checkout'"
      @no="modalClosed = true"
      :text="'A subscription is required to view this content.'"
    />
  </div>
</template>
<script lang="js">
import moment from 'moment'
import Vue from 'vue'
import VideoPlayer from '../../components/VideoPlayer.vue'
import AreYouSure from '../../components/AreYouSure.vue'

export default Vue.extend({
  name: 'VideoPage',
  components: {
    VideoPlayer,
    AreYouSure
  },
  data() {
    return {
      title: '',
      description: '',
      air_date: '',
      end_date: '',
      type: '',
      publish_date: '',
      images: [],
      favorite: false,
      streamUpcoming: false,
      streamLive: false,
      streamEnded: false,
      streamEndTime: moment(),
      entityEntitled: true,
      modalClosed: false,
    }
  },
  computed: {
    entitled() {
      return this.entityEntitled || this.modalClosed
    },
    routeId() {
      return this.$route.params.id
    },
    hdImage() {
      for (let i = 0; i < this.images.length; i++) {
        if (this.images[i].label === 'SD') {
          return this.images[i].url
        }
      }
      return ''
    },
    overlayImage() {
      if (this.type === 'live' && !this.streamLive) {
        return this.hdImage
      } else if (this.NumSources === 0 /* This video is not available */) {
        return this.hdImage
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
      .get(`/api/properties/` + this.property + `/videos/` + this.routeId)
      .then((res) => {
        const date = new Date(res.data.data.attributes.publish_date)
        const airDate = new Date(res.data.data.attributes.air_date)
        const endDate = new Date(res.data.data.attributes.end_date)
        this.streamEndTime = moment(endDate)
        const now = new Date()

        this.title = res.data.data.attributes.title
        this.description = res.data.data.attributes.description
        this.images = res.data.data.attributes.images
        this.type = res.data.data.attributes.video_type
        this.favorite = res.data.data.meta.favorite
        this.NumSources = res.data.data.attributes.sources.length
        this.entityEntitled = res.data.data.meta.entitled
          ? res.data.data.meta.entitled
          : false
        this.publish_date =
          date.getMonth() + 1 + '-' + date.getDate() + '-' + date.getFullYear()
        this.air_date =
          date.getMonth() + 1 + '-' + date.getDate() + '-' + date.getFullYear()
        if (now < airDate) {
          this.streamUpcoming = true
        } else if (now > airDate && now < endDate) {
          this.streamLive = true
        } else {
          this.streamEnded = true
        }
      })
      .catch((err) => {
        if (err) {
          this.$nuxt.error({ message: 'Video not found', status: 404 })
        }
      })
  },
  methods: {
    getTimeToStreamEnd() {
      const now = moment()
      return moment.duration(this.streamEndTime.diff(now)).asSeconds()
    },
    setFavorite() {
      if (!this.favorite) {
        this.$axios
          .post(
            `/api/properties/` +
              this.property +
              `/subscribers/me/favorites/videos`,
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
              `/subscribers/me/favorites/videos/` +
              this.routeId
          )
          .then(() => {
            this.favorite = false
          })
      }
    }
  }
})
</script>
<style lang="scss">
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

.video-container {
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 1000px;
  // width: 100%;
  // height: 100%;
}

.video-info {
  width: 100%;
  max-width: 1000px;
  margin-top: 20px;
}

.player-container {
  width: 100%;
  max-width: 1000px;
}

.button-container {
  display: flex;
  flex-flow: row wrap;
  align-items: space-around;
  justify-content: center;

  .button {
    margin: 5px;
  }
}
</style>
