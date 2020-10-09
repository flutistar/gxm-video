<template>
  <div
    v-show="visible && !errorLoading"
    @click="navigate"
    class="position-relative long-card"
  >
    <!-- Image Container -->
    <span class="image-container position-relative mb-2 cursor-pointer">
      <img
        :src="hdImage"
        @load="imageLoaded"
        v-show="!placeholder"
        :ref="'thumbnail'"
        class="image"
      />
      <img
        v-if="!entitled"
        class="locked"
        src="@/assets/images/lock.png"
        title="A subscription is required to view this video."
      />
      <img
        v-show="placeholder"
        src="@/assets/images/pgoplaceholder-sm.png"
        class="image"
      />
      <i :style="{ width: progressPercent }" class="progress-bar"
        ><span class="inner"></span
      ></i>
    </span>
    <!-- Text Container -->
    <span class="text-container">
      <small v-if="showTitle" class="title">
        {{ title }}
      </small>
      <br v-if="showTitle" />
      <small v-show="description !== ''" class="desc">
        {{ description }}
      </small>
      <br />
    </span>
  </div>
</template>
<script>
export default {
  name: 'LongCard',
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
    skeleton: {
      type: Boolean,
      default: () => false
    },
    showTitle: {
      type: Boolean,
      default: () => true
    },
    entityData: {
      type: Object,
      default: () => {}
    } // this should be {images: []Image; title: string; progress: number, entityType: 'video'|'collection'}
  },
  data() {
    return {
      title: '',
      date: '',
      images: [],
      progress: 0,
      description: '',
      errorLoading: false,
      showPlaceholder: false,
      userEntitled: false
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
    entitled() {
      return this.userEntitled
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
  async mounted() {
    if (this.entityData && this.entityData.images) {
      this.title = this.entityData.title
      this.entityType = this.entityData.type
      this.images = this.entityData.images
      this.userEntitled = this.entityData.entitled
      this.progress = this.entityData.progress
      if (this.entityData.description !== '') {
        this.description = this.entityData.description
      }
      return
    }

    if (this.entityType !== 'collection' && this.entityType !== 'video') {
      return
    }
    try {
      await this.$axios
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
          this.userEntitled = resp.data.data.meta.entitled
          this.description = resp.data.data.attributes.description

          // determine progress, 0 for collections
          // fetch serverProgress and localstorageProgress
          // and let localstorage Progress override serverProgress
          // but only if it is greater than serverProgress
          // so if an app set progress on the server, we'll use it
          let localProgress = 0
          const serverProgress = resp.data.data.meta.progress
          if (this.entityType === 'collection') {
            this.progress = 0
          } else if (process.browser) {
            localProgress = localStorage.getItem(resp.data.data.id)
            if (localProgress != null) {
            }
            if (localProgress != null && localProgress > serverProgress) {
              this.progress =
                (localProgress * 100000) / resp.data.data.attributes.duration
            } else {
              this.progress =
                (serverProgress * 100000) / resp.data.data.attributes.duration
            }
            if (this.progress > 100) {
              this.progress = 100
            }
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
      this.$showError({
        title: err.response.data.errors[0].title,
        text: this.entityId + ' ' + err.response.data.errors[0].detail
      })
    }
  },
  methods: {
    imageLoaded() {
      this.showPlaceholder = false
    },
    navigate() {
      if (this.entityType === 'video') {
        this.$router.push('/videos/' + this.entityId)
      }
      if (this.entityType === 'collection') {
        this.$router.push('/collections/' + this.entityId)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../assets/scss/global/_colors.scss';

.long-card {
  display: flex;
  flex-flow: row;
  flex-wrap: wrap;
  margin-bottom: 20px;
  cursor: pointer;
  background-color: $header-bg-color;
  transition: 0.2s;

  .image-container {
    display: flex;
    flex: 0 1 auto;
    max-width: 370px;
    height: 211px;
    margin-right: 10px;
    border: solid #293038 4px;
  }

  .text-container {
    display: flex;
    flex: 0 1 auto;
    flex-flow: column;
    min-width: 360px;
    max-width: 580px;
    height: 211px;
    padding-top: 10px;
    color: #c5c5c5;
  }

  .image {
    width: auto;
    height: 100%;
  }
  .video-card {
    height: 100%;
  }
  .title {
    max-width: 80%;
    font-size: 20px;
    font-style: italic;
    font-weight: 800;
    text-transform: uppercase;
  }
  .desc {
    font-size: 16px;
    font-weight: lighter;
  }
  .date {
    font-size: 14px;
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

.long-card:hover {
  color: #fff;

  .image-container {
    border: solid #303c44 4px;
  }

  .title {
    font-weight: 900;
    text-decoration: underline;
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
</style>
