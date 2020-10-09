<template>
  <div
    v-show="visible"
    @click="navigate(false)"
    :class="{ 'large-card': large, 'small-card': !large }"
    class="position-relative"
  >
    <div class="video-card text-left">
      <div
        v-if="placeholder || !showVideoPlayer"
        class="position-relative mb-2 cursor-pointer"
      >
        <img
          v-if="!entitled"
          class="locked"
          src="@/assets/images/lock.png"
          title="A subscription is required to view this video."
        />
        <img
          :src="hdImage"
          @load="imageLoaded"
          v-show="!placeholder"
          class="image"
        />
        <img
          v-show="placeholder"
          @load="imageLoaded"
          src="@/assets/images/pgoplaceholder-sm.png"
          class="image"
        />
        <i :style="{ width: progressPercent }" class="progress-bar"
          ><span class="inner"></span
        ></i>
        <!---->
      </div>
      <div v-if="showVideoPlayer" class="position-relative mb-2 cursor-pointer">
        <video-player
          :id="entityId"
          :overlay-image="!hideVideoPlayer ? undefined : hdImage"
          :property="property"
          :autoplay="true"
          @streamEnded="hideVideoPlayer = true"
          @streamStarted="hideVideoPlayer = false"
        />
      </div>
      <small @click="navigate(true)" v-if="showTitle" class="title">
        {{ title }}
      </small>
      <br />
    </div>
  </div>
</template>
<script>
import VideoPlayer from '../components/VideoPlayer.vue'

export default {
  name: 'SmallCard',
  components: {
    VideoPlayer
  },
  props: {
    entityType: {
      required: true,
      type: String
    },
    entityId: {
      required: true,
      type: String
    },
    visible: {
      type: Boolean,
      default: () => true
    },
    large: {
      type: Boolean,
      default: () => false
    },
    video: {
      type: Boolean,
      default: () => true
    },
    entityData: {
      type: Object,
      default: () => {}
    }, // this should be {images: []Image; title: string; progress: number, entityType: 'video'|'collection'}
    skeleton: {
      type: Boolean,
      default: () => false
    },
    showTitle: {
      required: false,
      type: Boolean,
      default: true
    },
    noReload: {
      required: false,
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      title: '',
      date: '',
      images: [],
      progress: 0,
      sourceLength: 0,
      entitled: true,
      showPlaceholder: true,
      hideVideoPlayer: false
    }
  },
  computed: {
    property() {
      return this.$store.state.property.property_id
    },
    progressPercent() {
      return String(this.progress) + '%'
    },
    placeholder() {
      return this.showPlaceholder || this.skeleton
    },
    showVideoPlayer() {
      return (
        this.large && this.video && this.entityType === 'video' && this.entitled
      )
    },
    hdImage() {
      for (let i = 0; i < this.images.length; i++) {
        if (this.images[i].label === 'SD') {
          return this.images[i].url
        }
      }
      return ''
    }
  },
  watch: {
    entityData() {
      if (this.entityData && this.entityData.images) {
        this.title = this.entityData.title
        this.entityType = this.entityData.type
        this.images = this.entityData.images
        this.progress = this.entityData.progress
        this.entitled = this.entityData.entitled
          ? this.entityData.entitled
          : false
        const type = this.entityData.video_type
        const now = new Date()
        const airDate = new Date(this.entityData.airDate)
        if (type === 'live' && now < airDate) {
          this.hideVideoPlayer = true
        } else {
          this.hideVideoPlayer = false
        }
      }
    }
  },
  mounted() {
    if (this.entityData && this.entityData.images) {
      this.title = this.entityData.title
      this.entityType = this.entityData.type
      this.images = this.entityData.images
      this.progress = this.entityData.progress
      this.entitled = this.entityData.entitled
        ? this.entityData.entitled
        : false
      const type = this.entityData.video_type
      const now = new Date()
      const airDate = new Date(this.entityData.airDate)
      if (type === 'live' && now < airDate) {
        this.hideVideoPlayer = true
      } else {
        this.hideVideoPlayer = false
      }
      // Large cards can show videos and need to load extra data
      if (!this.large) {
        return
      }
    }
    if (this.noReload) {
      return
    }

    if (this.entityType !== 'collection' && this.entityType !== 'video') {
      return
    }
    try {
      this.$axios
        .get(
          '/api/properties/' +
            this.property +
            '/' +
            (this.entityType === 'video' ? 'videos' : 'collections') +
            '/' +
            this.entityId
        )
        .then((resp) => {
          const date = new Date(resp.data.data.attributes.publish_date)
          this.title = resp.data.data.attributes.title
          this.images = resp.data.data.attributes.images

          this.entitled = resp.data.data.meta.entitled
            ? resp.data.data.meta.entitled
            : false
          if (this.entityType === 'collection') {
            this.progress = 0
          } else {
            const type = resp.data.data.attributes.video_type
            this.sourceLength = resp.data.data.attributes.sources.length
            const now = new Date()
            const airDate = new Date(resp.data.data.attributes.air_date)
            if (type === 'live' && now < airDate) {
              this.hideVideoPlayer = true
            } else {
              this.hideVideoPlayer = false
            }
            this.progress =
              100 *
              (resp.data.data.meta.progress /
                resp.data.data.attributes.duration)
          }
          this.date =
            date.getMonth() +
            1 +
            '-' +
            date.getDate() +
            '-' +
            date.getFullYear()
        })
    } catch (err) {
      this.errorLoading = true
      if (!err.response) {
        this.$showError({
          title: 'Error',
          text: err
        })
        return
      }
      this.$showError({
        title: err.response.data.errors[0].title,
        text: this.entityId + ' ' + err.response.data.errors[0].detail
      })
    }
  },
  methods: {
    navigate(forceNavigate) {
      if (!forceNavigate && this.showVideoPlayer) {
        return
      }
      if (this.entityType === 'video') {
        this.$router.push('/videos/' + this.entityId)
      }
      if (this.entityType === 'collection') {
        this.$router.push('/collections/' + this.entityId)
      }
    },
    imageLoaded() {
      this.showPlaceholder = false
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../assets/scss/global/_colors.scss';

.small-card {
  flex: 0 0 33.333%;
  width: 100%;
  max-width: 33.333%;
  height: 100%;
  padding-right: 15px;
  padding-left: 15px;
  cursor: pointer;
  transition: 0.5s;
  &:hover {
    opacity: 0.75;
  }

  @media (max-width: 550px) {
    flex: 0 0 100%;
    max-width: 100%;
  }
  .image {
    width: 100%;
  }
  .video-card {
    height: 100%;
  }
  .title {
    font-size: 16px;
    font-style: italic;
    font-weight: bold;
    text-transform: uppercase;
  }
  .position-relative {
    position: relative !important;
  }

  .progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 4px;
    background-color: $accent-color;
  }
}
.locked {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 12%;
  min-width: 15px;
  max-width: 40px;
  height: 15%;
  min-height: 15px;
  max-height: 40px;
  font-size: 30px;
  color: red;
}
.large-card {
  flex: 0 0 100%;
  width: 100%;
  max-width: 100%;
  height: 100%;
  padding-right: 15px;
  padding-left: 15px;
  cursor: pointer;
  transition: 0.5s;
  &:hover {
    opacity: 0.8;
  }

  @media (max-width: 550px) {
    flex: 0 0 100%;
    max-width: 100%;
  }
  .image {
    width: 100%;
  }
  .video-card {
    height: 100%;
  }
  .title {
    font-size: 16px;
    font-style: italic;
    font-weight: bold;
    text-transform: uppercase;
  }
  .position-relative {
    position: relative !important;
  }

  .progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 4px;
    background-color: $accent-color;
  }
}
</style>
