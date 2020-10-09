<template>
  <div>
    <div class="page">
      <div class="container">
        <div class="section">
          <div class="card-container">
            <!-- Use the CSS tab above to style your Element's container. -->
            <div id="card-element" class="MyCardElement">
              <!-- Elements will create input elements here -->
            </div>

            <!-- We'll put the error messages in this element -->
            <div id="card-errors" role="alert">
              {{ errors }}
            </div>
          </div>
          <div>
            <button id="submit" @click="pay" class="button">Save</button>
          </div>
        </div>
        {{ errorText }}
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'UpdateCard',
  data() {
    return {
      errors: '',
      errorText: '',
      stripe: undefined,
      cardElement: undefined,
      street: '',
      city: '',
      state: ''
    }
  },
  computed: {
    username() {
      return this.$store.state.auth.user.attributes.email
    },
    property() {
      return this.$store.state.property.property_id
    },
    currentPlanName() {
      return this.plans[this.currentPlanID].name
    }
  },
  mounted() {
    this.stripe = window.Stripe(
      process.env.stripe_key || 'pk_test_kbodKK6lY1o02ZI3w9rOw1Ln00JU0YUHjz'
    )
    const elements = this.stripe.elements()
    const style = {
      base: {
        color: 'white',
        fontFamily: '"Helveftica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    }

    this.cardElement = elements.create('card', { style })
    this.cardElement.mount('#card-element')
    this.cardElement.addEventListener('change', ({ error }) => {
      if (error) {
        this.errors = error.message
      } else {
        this.errors = ''
      }
    })
  },
  methods: {
    async pay() {
      if (!this.username) {
        return
      }
      const { paymentMethod, error } = await this.stripe.createPaymentMethod({
        type: 'card',
        card: this.cardElement,
        billing_details: {
          email: this.username
        }
      })
      this.$emit('updated-info', { paymentID: paymentMethod, error })
    }
  }
}
</script>
<style lang="scss">
.entitlements {
  display: flex;
  flex-flow: row;
  align-items: space-between;
  justify-content: flex-start;
  width: 100%;

  .button {
    border-radius: 0;
  }
}

.card-container {
  height: 50px;
  margin: 20px;
}
</style>
