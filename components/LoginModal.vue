<template>
  <div @click="$emit('no')" class="modal-background">
    <div @click.stop class="modal-content">
      <div class="login-container centered">
        <div class="copy-box">
          <h3>
            WATCH EXCLUSIVE LIVE POKER TOURNAMENTS & TV SHOWS
          </h3>
          <h4>
            Subscribe now for access to exclusive live events like the World
            Series of Poker, shows like High Stakes Poker and Poker After Dark,
            and original content like Pokerography and The Big Blind, plus so
            much more!
          </h4>
          <h3>
            START STREAMING TODAY
          </h3>
          <h4>
            Already a member? Sign in now to enjoy the top poker streaming app
            in the world.
          </h4>
        </div>
        <div class="login-box">
          <form @submit.prevent="login" class="form">
            <div>
              <h2>Sign In</h2>
              <div class="text-field">
                <label>Email Address</label>
                <input
                  id="username-input"
                  v-model="user"
                  type="email"
                  required
                />
              </div>
              <div class="text-field">
                <label>Password</label>
                <input
                  id="password-input"
                  v-model="pass"
                  type="password"
                  required
                />
              </div>
              <br />
              <span v-if="errorMessage !== ''" class="error-message">
                <font-awesome-icon icon="times" />
                {{ errorMessage }}
              </span>
            </div>
            <br />
            <button class="button" type="submit">
              Submit
            </button>
            <nuxt-link :to="'/register'">Register</nuxt-link> |
            <nuxt-link :to="'/forgot-password'">Forgot Password</nuxt-link>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="js">
import Vue from 'vue'

export default Vue.extend({
  name: 'LoginModal',
  props: {
    to: {
      type: String,
      required: false,
      default: undefined
    },
    text: {
      type: String,
      required: false,
      default: undefined
    },
    routerReplace: {
      type: Boolean
    }
  },
  data(){
      return {
          user: '',
          pass: '',
          errorMessage: ''
      }
  },
  computed: {
    destPath() {
      return this.$route.query.to || this.$route
    }
  },
  mounted(){
    if(this.$store.state.auth.user){
      this.$emit('no')
    }
  },
  methods: {
    async login() {
      this.errorMessage = '' // resets error message for resubmission
      try {
        await this.$auth
          .loginWith('local', {
            data: {
              username: this.user,
              password: this.pass
            }
          })
          .then((result) => {
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
            this.$emit('no')
          })
      } catch (err) {
        if(!err.response){
          return
        }
        if (err.response.data.errors[0].code === 401) {
          this.errorMessage = 'Username and/or password is incorrect.'
        } else {
          this.$showError({
            title: 'Login Error',
            text: err.response.data.errors[0].detail
          })
        }
      }
    }
  }
})
</script>
<style lang="scss" scoped>
@import '../assets/scss/global/_colors.scss';

.modal-background {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 5;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #0004;

  .modal-content {
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    width: 70%;
    min-width: 400px;
    max-width: 900px;
    min-height: 200px;
    overflow: hidden;
    text-align: center;
    background-color: $secondary-color;
    border: 1px solid $primary-color;
    border-radius: 5px;

    .modal-body {
      width: 70%;

      .modal-header {
        margin-top: 50px;
        margin-right: 10px;
        margin-left: 10px;
      }
    }
  }

  .form-field.is-horizontal {
    display: flex;
    flex-flow: row;
    justify-content: space-around;

    .button {
      width: 100px;
    }
  }
}

.login-container {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-evenly;
  width: 100%;
  max-width: 900px;
  padding: 30px;
  margin-top: 30px;

  @media screen and (max-width: 600px) {
    padding-top: 0;
    margin-top: 10px;
  }
}

.container {
  display: flex;
  flex-flow: row;
  height: 100%;
  padding: 20px;
}

.login-box {
  display: flex;
  flex-flow: column;
  width: 100%;
  min-width: 300px;
  max-width: 400px;
  height: 400px;
  text-align: left;
  h2 {
    padding-top: 0;
    margin-top: 0;
  }
  .text-field {
    margin-top: 10px;
  }

  .error-message {
    margin-top: 5px;
    font-size: 14px;
    color: $red;
  }
}
.form {
  width: 100%;
  margin: 0 !important;
}

.copy-box {
  display: flex;
  flex: 2;
  flex-flow: column;
  justify-content: cetner;
  min-width: 300px;
  max-width: 600px;
  padding: 10px;
  margin-right: 30px;
  margin-bottom: 30px;
  text-align: left;
  border: 0.5px solid $accent-color;

  @media screen and (max-width: 600px) {
    margin-right: 0;
  }

  h3 {
    font-weight: 700;

    @media screen and (max-width: 500px) {
      margin-bottom: 3px;
      font-size: 15px;
    }
  }

  h4 {
    padding-right: 20px;
    padding-left: 20px;
    margin-bottom: 20px;
    text-justify: inner-word;

    @media screen and (max-width: 500px) {
      margin-top: 5px;
      margin-bottom: 3px;
      font-size: 12px;
    }
  }
}
</style>
