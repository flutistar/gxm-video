<template>
  <div class="page">
    <div class="container">
      <div class="section">
        <form @submit.prevent="savePassword">
          <h3>
            Change Password
          </h3>
          <div class="field">
            <label for="old-password">Old Password</label>
            <input id="username-edit" v-model="oldPassword" type="password" />
          </div>
          <p v-if="passwordIncorrect === true" class="p-error">
            <font-awesome-icon icon="times" /> Current password is incorrect
          </p>
          <div class="field">
            <label for="new-password">New Password</label>
            <input
              id="newpassword-edit"
              v-model="newPassword"
              type="password"
            />
          </div>
          <div class="field">
            <label for="confirm-password">Confirm New Password</label>
            <input
              id="confirmpassword-edit"
              v-model="confirmPassword"
              type="password"
            />
            <button
              v-if="passwordMismatch !== true && passwordLength !== true"
              class="button"
              type="submit"
            >
              Save
            </button>
          </div>
          <p v-if="passwordMismatch" class="p-error">
            <font-awesome-icon icon="times" /> Passwords must match
          </p>
          <p v-if="passwordLength" class="p-error">
            <font-awesome-icon icon="times" /> Password must be 8 or more
            characters
          </p>
        </form>
      </div>
    </div>
    <generic-modal
      v-if="modalClosed === false"
      @no="modalClosed = true"
      @yes="redirect()"
      :to="'/account'"
      :text="'Password has been changed successfully.'"
    />
  </div>
</template>
<script>
import GenericModal from '../../components/GenericModal.vue'
export default {
  name: 'ChangePassword',
  components: {
    GenericModal
  },
  data() {
    return {
      editName: false,
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      modalClosed: true,
      passwordIncorrect: false
    }
  },
  computed: {
    passwordMismatch() {
      return (
        (this.newPassword !== '' || this.confirmPassword !== '') &&
        this.newPassword !== this.confirmPassword
      )
    },
    passwordLength() {
      return (
        (this.newPassword !== '' || this.confirmPassword !== '') &&
        this.newPassword.length < 8
      )
    },
    firstName() {
      return this.$store.state.auth.user.attributes.first_name
    },
    lastName() {
      return this.$store.state.auth.user.attributes.last_name
    },
    nameString() {
      return this.firstName + ' ' + this.lastName
    },
    email() {
      return this.$store.state.auth.user.attributes.email
    },
    property() {
      return this.$store.state.property.property_id
    }
  },
  methods: {
    async savePassword() {
      this.passwordIncorrect = false
      try {
        await this.$axios.post(
          '/api/properties/' +
            this.property +
            '/subscribers/me/change-password',
          JSON.stringify({
            data: {
              type: 'password_change',
              attributes: {
                old_password: this.oldPassword,
                new_password: this.newPassword,
                new_password_confirm: this.confirmPassword
              }
            }
          })
        )
        this.modalClosed = false
      } catch (err) {
        if (err.response.data.errors[0].code === 401) {
          this.passwordIncorrect = true
        } else if (err.response.data.errors[0].code !== 401) {
          if (err.response.data.errors) {
            this.$showError({
              title: err.response.data.errors[0].title,
              text: err.response.data.errors[0].detail
            })
          } else {
            this.$showError({ title: 'Error', text: err.response })
          }
        }
      }
    },
    redirect() {
      this.$router.push('/account')
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~/assets/scss/app.scss';

.page {
  display: flex;
  flex-flow: row;
  justify-content: center;
  width: 100%;
}
.container {
  width: 100%;
  max-width: 600px;
  height: 100%;
  padding: 20px;
}

.title {
  font-size: 20px;
}

.p-error {
  color: $red;
}

.field {
  margin-bottom: 10px;
  .button {
    margin-top: 20px;
  }
  &.horizontal {
    display: flex;
    flex-flow: row;
    justify-content: flex-start;
    &.apart {
      justify-content: space-between;
    }
    .field-item {
      width: 25%;
      min-width: 250px;
      margin-right: 20px;
    }
  }
}
.section {
  display: flex;
  flex-flow: column;
  justify-content: space-around;
  padding: 20px;
}
</style>
