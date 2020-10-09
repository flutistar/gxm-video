<template>
  <header class="site-header">
    <div v-if="!isIe11 || windowWidth >= 1150" class="nav-container">
      <div class="nav-burger-container">
        <div
          v-if="nav"
          @click="navVisible = !navVisible"
          :class="{ 'is-active': nav && (showNav || !isMobile) }"
          class="nav-burger"
        >
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      <nav class="site-nav" role="navigation" aria-label="main navigation">
        <nuxt-link class="site-title" to="/">
          <img src="~/assets/images/logo.png" />
        </nuxt-link>
        <span v-if="nav && (showNav || !isMobile)" class="site-nav">
          <nuxt-link
            @click.native="navVisible = false"
            v-for="view in views"
            :key="view.name"
            :to="view.route"
          >
            {{ view.display }}
          </nuxt-link>
          <nuxt-link @click.native="navVisible = false" :to="'/search'">
            Search
          </nuxt-link>
          <nuxt-link
            :to="'/checkout'"
            v-if="isMobile && shouldShowSubscribeButton"
            @click.native="navVisible = false"
          >
            Subscribe
          </nuxt-link>
          <nuxt-link
            @click.native="navVisible = false"
            v-if="isMobile && loggedIn"
            :to="'/account'"
            href="#"
          >
            Manage Account
          </nuxt-link>
          <a v-if="isMobile" href="tel:1-866-476-5374">
            1-866-476-5374
          </a>
          <a
            @click.native="navVisible = false"
            v-if="isMobile"
            @click="manageLogin"
            href="#"
            >{{ loginText }}</a
          >
        </span>
      </nav>
      <aside v-if="$route.path !== '/login'" class="user-info">
        <a href="tel:1-866-476-5374">
          1-866-476-5374
        </a>
        <nuxt-link
          :to="'/checkout'"
          v-if="shouldShowSubscribeButton"
          @click.native="navVisible = false"
          class="button small"
        >
          Subscribe
        </nuxt-link>
        <nuxt-link :to="'/account'" v-if="loggedIn" href="#">
          Manage Account
        </nuxt-link>
        <a @click="manageLogin">{{ loginText }}</a>
      </aside>
    </div>
    <div
      v-if="isIe11 && windowWidth < 1150"
      class="nav-container-ie11"
      role="navigation"
      aria-label="main navigation"
    >
      <nuxt-link to="/">
        <img src="~/assets/images/logo.png" class="ie11-logo" />
      </nuxt-link>
      <nuxt-link
        @click.native="navVisible = false"
        v-for="view in views"
        :key="view.name"
        :to="view.route"
        class="nuxt-link-ie11"
      >
        {{ view.display }}
      </nuxt-link>
      <nuxt-link
        @click.native="navVisible = false"
        :to="'/search'"
        class="nuxt-link-ie11"
      >
        Search
      </nuxt-link>
      <nuxt-link
        v-if="isMobile && shouldShowSubscribeButton"
        @click.native="navVisible = false"
        :to="'/checkout'"
        class="nuxt-link-ie11"
      >
        Subscribe
      </nuxt-link>
      <a
        v-if="$route.path !== '/login'"
        href="tel:1-866-4-POKERGO"
        class="nuxt-link-ie11"
      >
        1-866-4-POKERGO
      </a>
      <nuxt-link
        v-if="$route.path !== '/login' && shouldShowSubscribeButton"
        :to="'/checkout'"
        @click.native="navVisible = false"
        class="button small nuxt-link-ie11"
      >
        Subscribe
      </nuxt-link>
      <nuxt-link
        v-if="$route.path !== '/login' && loggedIn"
        :to="'/account'"
        href="#"
        class="nuxt-link-ie11"
      >
        Manage Account
      </nuxt-link>
      <a
        v-if="$route.path !== '/login'"
        @click="manageLogin"
        class="nuxt-link-ie11"
        >{{ loginText }}</a
      >
    </div>
  </header>
</template>
<script>
import Vue from 'vue'

export default Vue.extend({
  name: 'Navbar',
  props: {
    nav: {
      type: Boolean,
      default: () => true
    }
  },
  data() {
    return {
      navVisible: false,
      windowWidth: 900,
      isIe11: false
    }
  },
  computed: {
    loggedIn() {
      return this.$store.state.auth.user
    },
    loginText() {
      if (!this.$store.state.auth.user) {
        return 'Sign In'
      }
      return 'Log out'
    },
    showNav() {
      return this.navVisible
    },
    views() {
      return this.$store.state.property.default_views
    },
    isMobile() {
      return this.windowWidth < 1050
    },
    entitlements() {
      return this.$store.state.auth.user
        ? this.$store.state.auth.user.relationships.entitlements.data
        : []
    },
    shouldShowSubscribeButton() {
      return this.entitlements.length === 0
    }
  },
  watch: {
    'this.$auth.loggedIn'() {
      if (!this.$auth.loggedIn) {
        this.$router.push('/')
      }
    }
  },
  mounted() {
    this.windowWidth = window.innerWidth
    this.$nextTick(() => {
      window.addEventListener('resize', () => {
        this.windowWidth = window.innerWidth
        this.isIe11 = !!window.MSInputMethodContext && !!document.documentMode
      })
    })
  },
  methods: {
    async manageLogin() {
      if (this.$store.state.auth.user) {
        this.$router.push('/')
        await this.$auth.logout()
        window.location.reload()
      } else {
        this.$router.push({ path: this.$route.path, query: { login: 'show' } })
      }
    }
  }
})
</script>

<style lang="scss" scoped>
@import '../assets/scss/global/_colors.scss';

.site-header {
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 900;
  background-color: $header-bg-color;

  .nav-container {
    display: flex;
    flex-flow: row;
    width: 100%;
    padding: 0.5rem;
    .nav-burger-container {
      position: absolute;
      top: 20px;
      left: 25px;
      display: flex;
      flex-flow: row;
      align-items: center;
      justify-content: center;
      width: 40px;
      padding: 0.5rem;
    }
    .nav-burger {
      @media (min-width: 1050px) {
        display: none;
      }

      cursor: pointer;
      div {
        width: 35px;
        height: 5px;
        margin: 6px 0;
        background-color: #fff;
        transition: 0.25s;
      }

      &.is-active {
        div {
          width: 35px;
          height: 5px;
          margin: 6px 0;
          background-color: #fff;
          transition: 0.25s;
          &:nth-child(1) {
            transform: translateY(6px) rotate(45deg);
          }
          &:nth-child(2) {
            transform: translateY(-6px) rotate(-45deg);
          }
          &:nth-child(3) {
            opacity: 0;
          }
        }
      }
    }
  }

  @media (max-width: 1150px) {
    flex-direction: column;
  }
}

.site-title {
  width: 200px;
  min-width: 100px;
  max-width: 150px;
  margin-right: 25px;

  @media (max-width: 1150px) {
    margin-right: 0;
  }
  img {
    width: 100%;
  }
  h1 {
    padding: 0;
    margin: 0;
    font-size: 18px;
  }
}
.site-nav {
  display: flex;
  flex-grow: 1;
  align-items: center;
  padding-left: 25px;

  @media (max-width: 1150px) {
    display: flex;
    // flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding-left: 0;
    margin: 15px 0;
  }

  @media (max-width: 1050px) {
    flex-flow: column;
    justify-content: space-around;
  }
}
.user-info {
  display: flex;
  align-items: center;
  margin-right: 2px;

  @media (max-width: 1150px) {
    justify-content: flex-end;
    width: 100%;
  }

  @media (max-width: 1050px) {
    display: none;
    justify-content: space-around;
  }
  .username {
    margin: 0 25px;

    @media (max-width: 1050px) {
      display: none;
    }
  }
}
.site-nav a,
.user-info a {
  margin: 0 10px;

  @media (max-width: 1050px) {
    width: 40%;
    margin: 5px 0;
    text-align: center;
  }
}
</style>
