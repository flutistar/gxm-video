<template>
  <div v-touch:swipe.left="pageRight" v-touch:swipe.right="pageLeft">
    <p class="title">
      <strong>{{ specialTitle !== '' ? specialTitle : title }}</strong>
    </p>
    <div v-if="type === 'video'" style="width: 100%;">
      <long-card
        v-for="(entity, idx) in shownEntities"
        :key="idx + entity.id"
        :entity-id="entity.id"
        :entity-type="entity.type"
        :entity-data="entity.images ? entity : undefined"
        :style="{
          left: String((100 / numVisible) * -currentIdx) + '%'
        }"
        :large="large"
        :video="idx === currentIdx"
        :show-title="false"
        :no-reload="true"
        style="position: relative;"
      />
    </div>
    <div v-if="type === 'collection'" class="row">
      <!-- <keep-alive> -->
      <small-card
        v-for="(entity, idx) in shownEntities"
        :key="idx + entity.id"
        :entity-id="entity.id"
        :entity-type="entity.type"
        :entity-data="entity.images ? entity : undefined"
        :style="{
          left: String((100 / numVisible) * -currentIdx) + '%'
        }"
        :large="large"
        :video="idx === currentIdx"
        :show-title="showCardTitles"
        :no-reload="true"
        style="position: relative;"
      />
      <!-- </keep-alive> -->
      <div
        v-if="shownEntities.length > numVisible && currentIdx !== 0"
        @click="pageLeft()"
        :class="{ large: large }"
        class="left-button"
      >
        <span class="icon">
          <font-awesome-icon
            :icon="['fa', 'chevron-circle-left']"
            class="carosel-button"
          />
        </span>
      </div>
      <div
        v-if="
          shownEntities.length > numVisible &&
            currentIdx !== shownEntities.length - 1
        "
        @click="pageRight()"
        :class="{ large: large }"
        class="right-button"
      >
        <span class="icon" style="width: 2em; height: 2em;">
          <font-awesome-icon
            :icon="['fa', 'chevron-circle-right']"
            class="carosel-button"
          />
        </span>
      </div>
    </div>
  </div>
</template>
<script>
import SmallCard from '~/components/SmallCard.vue'
import LongCard from '~/components/LongCard.vue'

// These values also need to be set in smallcard.vue to make breakpoints work properly
// TODO: Move these into props so that we can set breakpoints from the same place
// >980px 4 cards
// 550-980px 3 Cards
// <550px 1 card

export default {
  name: 'Row',
  components: { SmallCard, LongCard },
  props: {
    entities: {
      type: Array,
      default: () => []
    },
    entitiesWithData: {
      // passed in from parent
      type: Array,
      default: () => []
    },
    specialTitle: {
      type: String,
      default: ''
    },
    collectionID: {
      type: String,
      default: ''
    },
    large: {
      type: Boolean,
      default: () => false
    },
    type: {
      type: String,
      default: 'collection'
    },
    showCardTitles: {
      default: true,
      required: false,
      type: Boolean
    }
  },
  data() {
    return {
      currentIdx: 0,
      windowWidth: 0,
      title: '',
      collectionEntities: [],
      collectionEntitiesWithData: [] // requested by row
    }
  },
  computed: {
    property() {
      return this.$store.state.property.property_id
    },
    visibleCards() {
      return this.entities.slice(
        this.currentIdx,
        this.currentIdx + this.numVisible
      )
    },
    shownEntities() {
      if (this.entitiesWithData.length !== 0) {
        return this.entitiesWithData
      } else if (this.collectionEntitiesWithData.length !== 0) {
        return this.collectionEntitiesWithData
      } else if (this.entities.length !== 0) {
        return this.entities
      } else {
        return this.collectionEntities
      }
    },
    numVisible() {
      if (this.large) {
        return 1
      }
      if (this.windowWidth > 550) {
        return 3
      } else if (this.windowWidth > 550) {
        return 3
      } else {
        return 1
      }
    }
  },
  watch: {
    currentIdx() {
      if (this.currentIdx < 0) {
        this.currentIdx = 0
      }
      if (this.currentIdx >= this.shownEntities.length) {
        this.currentIdx = this.shownEntities.length - 1
      }
    },
    numVisible() {
      if (this.numVisible === this.shownEntities.length) {
        this.currentIdx = 0
      }
    }
  },
  async mounted() {
    this.windowWidth = window.innerWidth
    this.$nextTick(() => {
      window.addEventListener('resize', () => {
        this.windowWidth = window.innerWidth
      })
    })

    if (this.entitiesWithData.length !== 0) {
      return
    }

    if (this.collectionID !== '') {
      if (this.type === 'collection') {
        try {
          await this.$axios
            .get(
              '/api/properties/' +
                this.property +
                '/collections' +
                '/' +
                this.collectionID +
                '?include=entities'
            )
            .then((resp) => {
              this.title = resp.data.data.attributes.title
              const included = resp.data.included
              const tmp = []
              if (included) {
                for (let i = 0; i < included.length; i++) {
                  let progressPercent = 0
                  const serverStorageTime =
                    included[i].meta.progress / included[i].attributes.duration
                  if (process.browser) {
                    const localStorageTime = localStorage.getItem(
                      included[i].id
                    )
                    if (
                      localStorageTime !== null &&
                      localStorageTime > serverStorageTime
                    ) {
                      progressPercent =
                        100000 *
                        (localStorageTime / included[i].attributes.duration)
                    }
                  }
                  tmp.push({
                    id: included[i].id,
                    title: included[i].attributes.title,
                    type: included[i].type,
                    images: included[i].attributes.images,
                    entitled: included[i].meta.entitled,
                    progress: progressPercent,
                    airDate: included[i].airDate,
                    video_type: included[i].video_type
                  })
                }
              }
              this.collectionEntitiesWithData = tmp
              this.collectionEntities =
                resp.data.data.relationships.entities.data
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
            title: 'Collection not found: ' + err.response.data.errors[0].title,
            text: this.collectionID + ' ' + err.response.data.errors[0].detail
          })
        }
      } else {
        try {
          await this.$axios
            .get(
              '/api/properties/' +
                this.property +
                '/videos' +
                '/' +
                this.collectionID
            )
            .then((resp) => {
              this.title = resp.data.data.attributes.title
              this.collectionEntities = [
                { type: 'video', id: this.collectionID }
              ]
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
            text: this.collectionID + ' ' + err.response.data.errors[0].detail
          })
        }
      }
    }
  },
  methods: {
    pageLeft() {
      this.currentIdx = this.currentIdx - 1
    },
    pageRight() {
      this.currentIdx = this.currentIdx + 1
    },
    cardVisible(idx) {
      return idx < this.currentIdx + this.numVisible && idx >= this.currentIdx
    },
    async fetchCollectionData() {
      if (this.type === 'collection') {
        try {
          await this.$axios
            .get(
              '/api/properties/' +
                this.property +
                '/collections' +
                '/' +
                this.collectionID +
                '?include=entities'
            )
            .then((resp) => {
              this.title = resp.data.data.attributes.title
              const included = resp.data.included
              const tmp = []
              if (included) {
                for (let i = 0; i < included.length; i++) {
                  let progressPercent = 0
                  const serverStorageTime =
                    included[i].meta.progress / included[i].attributes.duration
                  if (process.browser) {
                    const localStorageTime = localStorage.getItem(
                      included[i].id
                    )
                    if (
                      localStorageTime !== null &&
                      localStorageTime > serverStorageTime
                    ) {
                      progressPercent =
                        100000 *
                        (localStorageTime / included[i].attributes.duration)
                    }
                  }
                  tmp.push({
                    id: included[i].id,
                    title: included[i].attributes.title,
                    type: included[i].type,
                    images: included[i].attributes.images,
                    entitled: included[i].meta.entitled,
                    progress: progressPercent,
                    airDate: included[i].airDate,
                    video_type: included[i].video_type
                  })
                }
              }
              this.collectionEntitiesWithData = tmp
              this.collectionEntities =
                resp.data.data.relationships.entities.data
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
            title: 'Collection not found: ' + err.response.data.errors[0].title,
            text: this.collectionID + ' ' + err.response.data.errors[0].detail
          })
        }
      } else {
        try {
          await this.$axios
            .get(
              '/api/properties/' +
                this.property +
                '/videos' +
                '/' +
                this.collectionID
            )
            .then((resp) => {
              this.title = resp.data.data.attributes.title
              this.collectionEntities = [
                { type: 'video', id: this.collectionID }
              ]
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
            text: this.collectionID + ' ' + err.response.data.errors[0].detail
          })
        }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../assets/scss/global/_colors.scss';

.title {
  font-size: 20px;
}

.row {
  position: relative;
  display: flex;
  flex-flow: row;
  width: 100%;
  margin-top: 20px;
  margin-bottom: 20px;
  overflow-x: hidden;
  overflow-y: hidden;
}

.left-button {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-flow: row;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 100%;
  color: white;
  cursor: pointer;
  background-image: linear-gradient(
    to left,
    rgba(0, 0, 0, 0),
    rgba(50, 50, 50, 0.05),
    rgba(111, 111, 111, 0.1)
  );

  &.large {
    height: 95%;
    background-image: none;
  }
}
.left-button:hover {
  background-image: linear-gradient(
    to left,
    rgba(0, 0, 0, 0),
    rgba(50, 50, 50, 0.1),
    rgba(111, 111, 111, 0.2)
  );
}
.right-button {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-flow: row;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 100%;
  color: white;
  cursor: pointer;
  background-image: linear-gradient(
    to right,
    rgba(0, 0, 0, 0),
    rgba(50, 50, 50, 0.05),
    rgba(111, 111, 111, 0.1)
  );

  &.large {
    height: 95%;
    background-image: none;
  }
}
.right-button:hover {
  background-image: linear-gradient(
    to right,
    rgba(0, 0, 0, 0),
    rgba(50, 50, 50, 0.1),
    rgba(111, 111, 111, 0.2)
  );
}
.carosel-button {
  width: 2em;
  height: 2em;
  opacity: 0.2;
}
.carosel-button:hover {
  width: 2em;
  height: 2em;
  opacity: 0.4;
}
.arrow {
  display: inline-block;
  padding: 3px;
  border: solid $white;
  border-width: 0 3px 3px 0;
}

.up {
  -webkit-transform: rotate(-135deg);
  transform: rotate(-135deg);
}

.down {
  -webkit-transform: rotate(45deg);
  transform: rotate(45deg);
}
</style>
