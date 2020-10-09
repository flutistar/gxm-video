<template>
  <div class="page">
    <div class="container centered">
      <div class="login-box">
        <form @submit.prevent="login">
          <div>
            <h2>Create account</h2>
            <div class="text-field">
              <label>First Name *</label>
              <input v-model="first" type="text" required />
            </div>
            <div class="text-field">
              <label>Last Name *</label>
              <input v-model="last" type="text" required />
            </div>
            <div class="text-field">
              <label>Age *</label>
              <input
                v-model="age"
                type="number"
                min="0"
                class="textbox"
                required
              />
            </div>
            <div class="text-field">
              <label>Email *</label>
              <input v-model="user" type="email" required />
            </div>
            <div class="text-field">
              <label>Password *</label>
              <input v-model="pass" type="password" required />
            </div>
            <div class="text-field">
              <label>Confirm Password *</label>
              <input v-model="passConfirm" type="password" required />
            </div>
          </div>
          <br />
          <button class="button" type="submit">
            Continue
          </button>
          <p class="error-message">{{ errorMessage }}</p>
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
  head() {
    return {
      title: 'Register'
    }
  },
  data() {
    return {
      first: '',
      last: '',
      user: '',
      pass: '',
      passConfirm: '',
      errorMessage: '',
      age: ''
    }
  },
  computed: {
    property() {
      return this.$store.state.property.property_id
    },
    destPath() {
      return this.$route.query.to || undefined
    }
  },
  mounted() {
    this.$store.commit('property/setLoginText', '')
    this.$store.commit('property/showLoginLogo', true)
  },
  methods: {
    validEmail(email) {
      // eslint-disable-next-line
      const regexp = /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/gi
      if (regexp.test(email)) {
        return false
      } else {
        return true
      }
    },
    async login() {
      this.errorMessage = ''
      if (this.validEmail(this.user)) {
        this.errorMessage = 'Please enter a valid email address'
      }
      if (this.pass !== this.passConfirm) {
        this.errorMessage = 'Passwords Must Match'
      }
      if (this.pass.length < 8) {
        this.errorMessage = 'Password must be 8 or more characters'
      }
      if (this.age < 18) {
        this.errorMessage = 'Must be Over 18 to Create an Account'
      }
      if (this.errorMessage === '') {
        try {
          const res = await this.$axios.post(
            '/api/properties/' + this.property + '/register',
            JSON.stringify({
              data: {
                type: 'subscriber',
                attributes: {
                  email: this.user,
                  first_name: this.first,
                  last_name: this.last,
                  property_id: this.property,
                  password: this.pass
                },
                meta: {
                  age: this.age
                }
              }
            })
          )
          this.$axios.$post(
            `/api/events`,
            {
              data: {
                attributes: {
                  userId: res.data.id,
                  type: 'event',
                  action: 'app:newId'
                }
              }
            },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          )
          // Log the user in
          try {
            await this.$auth.loginWith('local', {
              data: {
                username: this.user,
                password: this.pass
              }
            })
            this.$axios.$post(
              `/api/events`,
              {
                data: {
                  type: 'subscriber',
                  attributes: {
                    viewer: this.$store.state.auth.user.id,
                    sessionId: this.$store.state.property.sessionId,
                    type: 'event',
                    action: 'app:init'
                  }
                }
              },
              {
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            )
            this.$router.push('/checkout')
          } catch (err) {
            this.$showError({
              title: 'Login Error',
              text: err.response.data
            })
          }
        } catch (err) {
          if (err.status === 409) {
            this.errorMessage = 'This user already exists, please login'
          } else {
            this.errorMessage = err.response.data.errors[0].detail
          }
        }
      }
    }
  }
}
</script>
<style scoped lang="scss">
@import '~/assets/scss/app.scss';

.page {
  margin-top: 40px;
}

.container {
  display: flex;
  flex-flow: row;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;

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
