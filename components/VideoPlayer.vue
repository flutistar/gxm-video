<template>
  <div>
    <div id="videoPlayer" ref="videoPlayerRef" class="video-player-box"></div>
    <img :src="overlayImage" v-if="overlayImage !== ''" class="overlay" />
  </div>
</template>

<script>
import UUID from 'uuid'
import moment from 'moment'

export default {
  name: 'VideoPlayer',
  props: {
    id: {
      required: true,
      type: String
    },
    property: {
      required: true,
      type: String
    },
    fluid: {
      default: true,
      type: Boolean
    },
    options: {
      type: Object,
      default: null
    },
    overlayImage: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      player: undefined,
      defaultOptions: {
        title: '',
        type: 'application/x-mpegURL',
        src: '',
        poster: '',
        duration: 0,
        videoSessionID: UUID.v4(),
        videoSessionStarted: new Date(),
        oddUserAgent: 'platform[name]=web&build[version]=web'
      },
      streamInfo: {
        endDate: undefined,
        airDate: undefined
      },
      liveSource: {},
      source: '',
      isReady: false,
      title: '',
      initialPlayingPosition: 'unset',
      duration: 0,
      serverProgress: 0,
      TRACKING_VIDEO_EVENTS: process.env.TRACKING_VIDEO_EVENTS === 'true',
      VIDEO_PROGRESS_POST_DELAY: process.env.VIDEO_PROGRESS_POST_DELAY,
      checkedProgress: false,
      lastProgressPosted: new Date(),
      videoType: '',
      videoSessionID: UUID.v4(),
      videoSessionStarted: new Date()
    }
  },
  computed: {
    userID() {
      return this.$store.state.auth.user
        ? this.$store.state.auth.user.id
        : 'anonymous'
    }
  },
  watch: {
    $route() {
      if (this.$store.state.auth.user) {
        this.tickCurrentTime()
      }
    },
    overlayImage() {
      let videoSource = 'https://cdn.jwplayer.com/v2/media/' + this.source
      if (this.videoType === 'live') {
        videoSource = [{ file: this.liveSource.url }]
      }
      if (this.overlayImage === '' || this.overlayImage === undefined) {
        this.initPlayer(videoSource)
      } else {
        this.destroyPlayer()
      }
    }
  },
  async mounted() {
    await this.fetchData()
    const now = moment()
    const el = this

    if (this.videoType === 'live') {
      setTimeout(() => {
        el.$emit('streamStarted')
      }, moment.duration(this.streamInfo.airDate.diff(now)).asSeconds() * 1000)
      setTimeout(() => {
        el.$emit('streamEnded')
      }, moment.duration(this.streamInfo.endDate.diff(now)).asSeconds() * 1000)
    }
    let videoSource = 'https://cdn.jwplayer.com/v2/media/' + this.source
    if (this.videoType === 'live' || this.videoType === 'linear') {
      videoSource = [{ file: this.liveSource.url }]
    }
    this.$nextTick(() => {
      if (this.overlayImage !== '' && this.overlayImage !== undefined) {
        return
      }
      try {
        this.initPlayer(videoSource)
      } catch (err) {}
    })
  },
  methods: {
    initPlayer(videoSource) {
      if (this.player !== undefined) {
        return
      }
      this.player = window.jwplayer('videoPlayer')
      const autoStart =
        this.$nuxt.$route.name !== 'schedule' &&
        this.$nuxt.$route.name !== 'index'

      this.player.setup({
        playlist: videoSource,
        autostart: autoStart
      })
      this.player.on('bufferChange', this.tickCurrentTime)
      this.player.on('play', this.onPlayerPlay)
      this.player.on('pause', this.onPlayerPause)
      this.player.on('seeked', this.onSeeked)
      this.player.on('error', this.onPlayerError)
      this.player.on('complete', this.onPlayerEnded)
    },
    destroyPlayer() {
      if (this.player === undefined) {
        return
      }
      this.player.remove()
      this.player = undefined
    },
    tickCurrentTime(event) {
      if (event === undefined) {
        return
      }
      if (this.videoType !== 'vod') {
        return
      }
      if (process.browser) {
        const localStorageTime = localStorage.getItem(this.id)
        const playerPosition = this.player.getPosition()
        const serverProgress = this.serverProgress
        const maxProgress = Math.max(
          ...[localStorageTime, playerPosition, serverProgress]
        )
        if (this.initialPlayingPosition === 'unset') {
          this.player.seek(maxProgress)
          this.initialPlayingPosition = 'set'
          this.onPlayerSessionStarted(event)
        }
        if (this.isNumeric(maxProgress)) {
          localStorage.setItem(this.id, maxProgress.toString())
        }
      }
    },
    noThrottle(currentTime) {
      return (
        currentTime - this.lastProgressPosted > this.VIDEO_PROGRESS_POST_DELAY
      )
    },
    isNumeric(n) {
      return !isNaN(parseFloat(n)) && isFinite(n)
    },
    async fetchData() {
      const val = await this.$axios
        .get(`/api/properties/` + this.property + `/videos/` + this.id)
        .then((res) => {
          const airDate = moment(res.data.data.attributes.air_date)
          const endDate = moment(res.data.data.attributes.end_date)
          this.streamInfo.endDate = endDate
          this.streamInfo.airDate = airDate
          const source = res.data.data.attributes.sources[0]
          this.liveSource = source
          this.title = res.data.data.attributes.title
          this.duration = res.data.data.attributes.duration
          this.source = res.data.data.attributes.source
          this.serverProgress = res.data.data.meta.progress / 1000
          this.videoType = res.data.data.attributes.video_type
          if (
            (this.liveSource === {} || this.liveSource === undefined) &&
            source.sourceType === 'live'
          ) {
            this.isReady = false
            this.sources = []
          } else {
            this.isReady = true
          }
        })
      return val
    },
    onSeeked(event) {
      const autoStart =
        this.$nuxt.$route.name !== 'schedule' &&
        this.$nuxt.$route.name !== 'index'

      if (!autoStart) {
        this.player.pause(true)
      }
    },
    postCurrentTime(event) {
      const now = new Date()
      if (this.TRACKING_VIDEO_EVENTS) {
        if (this.noThrottle(now)) {
          this.$axios.patch(
            `/api/properties/` +
              this.property +
              `/subscribers/me/progress/` +
              this.id,
            {
              data: {
                id: this.id,
                type: 'video',
                meta: {
                  progress: Math.floor(event.currentTime) * 1000
                }
              }
            },
            {
              headers: { 'Content-Type': 'application/vnd.api+json' },
              progress: false
            }
          )
          this.lastProgressPosted = now
          this.serverProgress = event.currentTime
        }
      }
    },
    // --------- Video Event Tracking --------
    // We will focus on tracking ui events, not sending data every second
    // but we will include timestamps so that we can recreate what user sessions and video sessions were like
    // Each sessionId is created and the initial time is recorded on the app loading
    // Each videoSessionID is created and it's initial time is recorded on the onPlayerLoadeddata event
    // Each time the play button is clicked or the video is scrubbed to a new location the video:play event is sent
    // this event includes the location of the scrub point and the videoSessionElapsed time
    // the delta between these two can be use to determine if someone has scrubbed forwards or backwards
    // the video:complete event will trigger when someone reaches the end of a video
    // and video:error should record error information
    onPlayerSessionStarted(event) {
      this.initialPlayingState = 'begun'
      this.duration = this.player.getDuration()
      const playerPosition = this.player.getPosition()

      this.videoSessionStarted = new Date()
      if (this.TRACKING_VIDEO_EVENTS) {
        this.$axios.$post(
          `/api/events`,
          {
            data: {
              attributes: {
                viewer: this.userID,
                sessionID: this.$store.state.property.sessionID,
                videoSessionID: this.videoSessionID,
                type: 'event',
                action: 'video:load',
                contentId: this.id,
                duration: this.duration,
                elapsed: new Date() - this.videoSessionStarted,
                contentTitle: this.title,
                contentType: 'video',
                location: playerPosition,
                player: 'web'
              }
            }
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Odd-User-Agent': this.oddUserAgent
            }
          }
        )
      }
    },
    onPlayerPlay(event) {
      const now = new Date()
      if (this.initialPlayingState === 'paused') {
        // it's the first time we've loaded the video
        this.onPlayerSessionStarted(event)
      } else if (this.TRACKING_VIDEO_EVENTS && this.noThrottle(now)) {
        // is the currentPosition greater than any previously saved progress?
        // if so then the user just scrubbed forward and it should be sent
        const playerPosition = this.player.getPosition()
        const serverProgress = this.serverProgress

        if (playerPosition > serverProgress) {
          this.$axios.$post(
            `/api/events`,
            {
              data: {
                attributes: {
                  viewer: this.userID,
                  sessionID: this.$store.state.property.sessionID,
                  videoSessionID: this.videoSessionID,
                  type: 'event',
                  action: 'video:play',
                  contentId: this.id,
                  duration: this.duration,
                  elapsed: new Date() - this.videoSessionStarted,
                  contentTitle: this.title,
                  contentType: 'video',
                  location: playerPosition,
                  player: 'web'
                }
              }
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'X-Odd-User-Agent': this.oddUserAgent
              }
            }
          )
          this.lastProgressPosted = now
          this.serverProgress = playerPosition
        }
      }
    },
    onPlayerPause(event) {
      const playerPosition = this.player.getPosition()
      const now = new Date()
      if (
        this.TRACKING_VIDEO_EVENTS &&
        this.initialPlayingState !== 'paused' &&
        this.noThrottle(now)
      ) {
        this.$axios.$post(
          `/api/events`,
          {
            data: {
              attributes: {
                viewer: this.userID,
                sessionID: this.$store.state.property.sessionID,
                videoSessionID: this.videoSessionID,
                type: 'event',
                action: 'video:stop',
                contentId: this.id,
                duration: this.duration,
                elapsed: new Date() - this.videoSessionStarted,
                contentTitle: this.title,
                contentType: 'video',
                location: playerPosition,
                player: 'web'
              }
            }
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Odd-User-Agent': this.oddUserAgent
            }
          }
        )
        this.postCurrentTime(event)
        this.serverProgress = playerPosition
      }
    },
    onPlayerEnded(event) {
      const playerPosition = this.player.getPosition()
      if (process.browser) {
        if (this.isNumeric(playerPosition)) {
          localStorage.setItem(this.id, playerPosition)
        }
      }
      if (this.TRACKING_VIDEO_EVENTS) {
        this.$axios.$post(
          `/api/events`,
          {
            data: {
              attributes: {
                viewer: this.userID,
                sessionID: this.$store.state.property.sessionID,
                videoSessionID: this.videoSessionID,
                type: 'event',
                action: 'video:complete',
                contentId: this.id,
                duration: this.duration,
                elapsed: new Date() - this.videoSessionStarted,
                contentTitle: this.title,
                contentType: 'video',
                location: playerPosition,
                player: 'web'
              }
            }
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Odd-User-Agent': this.oddUserAgent
            }
          }
        )
        this.postCurrentTime(event)
        this.serverProgress = playerPosition
      }
    },
    onPlayerError(event) {
      const playerPosition = this.player.getPosition()
      if (this.TRACKING_VIDEO_EVENTS) {
        this.$axios.$post(
          `/api/events`,
          {
            data: {
              attributes: {
                viewer: this.userID,
                sessionID: this.$store.state.property.sessionID,
                videoSessionID: this.videoSessionID,
                type: 'event',
                action: 'video:error',
                contentId: this.id,
                duration: this.duration,
                elapsed: new Date() - this.videoSessionStarted,
                contentTitle: this.title,
                contentType: 'video',
                location: playerPosition,
                errorMessage: event,
                player: 'web'
              }
            }
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Odd-User-Agent': this.oddUserAgent
            }
          }
        )
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import './../assets/scss/app';

.overlay {
  width: 100%;
  height: 100%;
}
</style>
