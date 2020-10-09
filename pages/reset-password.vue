<template>
  <div class="page">
    <div class="container">
      <div class="login-box">
        <form @submit.prevent="reset">
          <div>
            <h2>Reset Password</h2>
            <div class="text-field">
              <label>New Password</label>
              <input
                id="username-input"
                v-model="confirmPass"
                type="password"
                required
              />
            </div>
            <div class="text-field">
              <label>Confirm Password</label>
              <input
                id="password-input"
                v-model="pass"
                type="password"
                required
              />
            </div>
            <div>
              <p v-if="errorMessage !== ''" class="p-error">
                <font-awesome-icon icon="times" /> {{ errorMessage }}
              </p>
            </div>
          </div>
          <br />
          <button class="button" type="submit">
            Login
          </button>
          <nuxt-link :to="'/register'">Register</nuxt-link>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
  layout: 'login',
  components: {},
  data() {
    return {
      user: '',
      pass: '',
      errorMessage: '',
      confirmPass: ''
    }
  },
  computed: {
    property() {
      return this.$store.state.property.property_id
    },
    passwordKey() {
      return this.$route.hash.substr(1)
    }
  },
  watch: {},
  mounted() {},
  methods: {
    async reset() {
      if (this.pass.length < 8) {
        this.errorMessage = 'Password must be 8 or more characters'
      } else {
        try {
          await this.$axios.post(
            '/api/properties/' + this.property + '/subscribers/change-password',
            JSON.stringify({
              data: {
                attributes: {
                  old_password: this.passwordKey,
                  new_password: this.pass,
                  new_password_confirm: this.confirmPass
                },
                type: 'password_change'
              }
            })
          )
          this.$router.push('/login')
        } catch (err) {
          this.$showError({
            title: err.response.data.errors[0].title,
            text: err.response.data.errors[0].detail
          })
        }
      }
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
