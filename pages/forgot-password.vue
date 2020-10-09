<template>
  <div class="page">
    <div class="container">
      <div class="login-box">
        <form @submit.prevent="submit">
          <div>
            <h2>Forgot Password</h2>
            <div class="text-field">
              <label>Email</label>
              <input id="username-input" v-model="user" type="email" required />
            </div>
          </div>
          <div>
            <p v-if="errorMessage !== ''" class="p-error">
              <font-awesome-icon icon="times" /> {{ errorMessage }}
            </p>
          </div>
          <button class="button" type="submit">
            Reset
          </button>
        </form>
      </div>
    </div>
    <generic-modal
      v-if="modalClosed === false"
      @yes="redirect()"
      @no="modalClosed = true"
      :text="
        `An email with instructions on how to reset your password has been sent to ${user}.<br /><br/>Check your spam or junk folder if you don’t see the email in your inbox.
        If you no longer have access to this email account or have any questions, please <a href='/faq'>contact us</a>.`
      "
    />
  </div>
</template>

<script>
import GenericModal from '../components/GenericModal.vue'
export default {
  name: 'LoginView',
  layout: 'login',
  components: {
    GenericModal
  },
  data() {
    return {
      user: '',
      errorMessage: '',
      modalClosed: true
    }
  },
  computed: {
    destPath() {
      return this.$route.query.to || '/'
    },
    property() {
      return this.$store.state.property.property_id
    }
  },
  watch: {
    'this.$auth.loggedIn'() {
      if (this.$auth.loggedIn) {
        this.$router.push(this.destPath)
      }
    }
  },
  mounted() {
    this.$store.commit('property/setLoginText', '')
    this.$nextTick(() => {
      if (this.$auth.loggedIn) {
        this.$router.push(this.destPath)
      }
    })
  },
  methods: {
    async submit() {
      this.modalClosed = true
      try {
        await this.$axios.post(
          '/api/properties/' +
            this.property +
            '/subscribers/reset-password?email=' +
            encodeURIComponent(this.user)
        )
        this.modalClosed = false
      } catch (err) {
        if (err.response.data.errors[0].code === 404) {
          this.errorMessage = 'Email not found.'
        } else {
          this.$showError({
            title: 'Reset Error',
            text: err.response.data.errors[0].detail
          })
        }
      }
    },
    redirect() {
      this.$router.push('/login')
    }
  }
}
</script>
<style scoped lang="scss">
@import '~/assets/scss/app.scss';

.container {
  display: flex;
  flex-flow: row;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;

  .p-error {
    padding-top: 10px;
    margin-bottom: 0;
    color: $red;
  }

  .button {
    margin-top: 10px;
  }

  .login-box {
    display: flex;
    flex-flow: column;
    justify-content: space-around;
    width: 30%;
    min-width: 300px;
    max-width: 500px;
    height: 400px;
    padding: 20px;

    .text-field {
      margin-top: 10px;
    }

    .error-message {
      margin-top: 5px;
      font-size: 12px;
      color: $red;
    }
  }
}
</style>
