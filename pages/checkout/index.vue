<template>
  <div>
    <div class="page">
      <div class="container">
        <div class="section">
          <h2>
            Choose your plan:
          </h2>
        </div>
        <div class="pricing-container">
          <div
            v-for="(plan, idx) in plans"
            :key="plan.id"
            :class="{
              active: idx === currentPlanID,
              emphasis: emphasisPlan === plan.id
            }"
            class="single-plan"
          >
            <h3 class="plan-title">{{ plan.name }}</h3>
            <div class="plan-description">
              <p class="description">{{ plan.description }}</p>
            </div>
            <div class="pricing-area">
              <h4>{{ plan.price }}</h4>
            </div>
            <div>
              <button
                @click="purchase(plan.id, plan.name, plan.price, idx)"
                class="button"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- <button id="submit" @click="" class="button">
              Checkout With Credit Card
            </button>
            <p v-if="success" class="successText">Plan Purchased Successfully</p> -->
</template>
<script>
import getSymbolFromCurrency from 'currency-symbol-map'
export default {
  // Steps (if subscriber exists)
  // Check not already entitled elsewhere
  // Get payment method id from stripe
  // Send payment method to server to be associated with a subscriber (possibly include plan to subscribe to)
  // Plan corresponds to an entitlement
  // Create Stripe customer with associated customer id which corresponds to a subscriber if it does not exist
  // Where should customer creation occur?
  // - Add new endpoint or add it to a transaction creation when stripe field exists
  // - When are recepits validated/when is update called?
  // - What to do if a customer already has a subscription on another platform and how do i check this
  // - Should I just create a /purchase endpoint
  // Create a subscription with the customer id, should probably store stripe id for this in a transaction

  data() {
    return {
      errors: '',
      errorText: '',
      stripe: undefined,
      paypal: [],
      cardElement: undefined,
      plans: [],
      currentPlanID: 0
    }
  },
  computed: {
    username() {
      return this.$store.state.auth.user.attributes.email
    },
    success() {
      return this.$route.query.success === 'true'
    },
    property() {
      return this.$store.state.property.property_id
    },
    currentPlanName() {
      return this.plans[this.currentPlanID].name
    },
    emphasisPlan() {
      return this.$route.query.plan ? this.$route.query.plan : ''
    }
  },
  mounted() {
    if (this.success) {
      this.$router.push('/')
    }
    if (!this.$store.state.auth.user) {
      this.$router.push({
        path: '/checkout',
        query: { login: 'show', to: 'checkout' }
      })
    }
    this.stripe = window.Stripe(
      process.env.stripe_key || 'pk_test_kbodKK6lY1o02ZI3w9rOw1Ln00JU0YUHjz'
    )
    this.$axios
      .get(`/api/properties/` + this.property + `/products/`)
      .then((res) => {
        if (res.data && res.data.data) {
          res.data.data.forEach((element) => {
            const symbol = getSymbolFromCurrency(
              element.attributes.price[0].currency
            )
            let timeUnit
            switch (element.attributes.product_type) {
              case 'monthly':
                timeUnit = 'month'
                break
              case 'quarterly':
                timeUnit = 'quarter'
                break
              case 'annual':
                timeUnit = 'year'
                break
              default:
                timeUnit = 'month'
                break
            }
            this.plans.push({
              id: element.id,
              name: element.attributes.name,
              description: element.attributes.description,
              price:
                symbol + element.attributes.price[0].value + '/' + timeUnit,
              type: element.attributes.product_type,
              stripe_id: element.attributes.stripe_product_id,
              paypal_id: element.attributes.paypal_product_id,
              priceNumber: element.attributes.price[0].value
            })
          })
          this.$store.commit('property/setCheckoutPlans', this.plans)
        }
      })
      .catch((err) => {
        if (err) {
          this.$nuxt.error({ message: 'No plan available', status: 404 })
        }
      })
    // const elements = this.stripe.elements()
    // const style = {
    //   base: {
    //     color: 'white',
    //     fontFamily: '"Helveftica Neue", Helvetica, sans-serif',
    //     fontSmoothing: 'antialiased',
    //     fontSize: '16px',
    //     '::placeholder': {
    //       color: '#aab7c4'
    //     }
    //   },
    //   invalid: {
    //     color: '#fa755a',
    //     iconColor: '#fa755a'
    //   }
    // }

    // this.cardElement = elements.create('card', { style })
    // this.cardElement.mount('#card-element')
    // this.cardElement.addEventListener('change', ({ error }) => {
    // if (error) {
    // this.errors = error.message
    // } else {
    // this.errors = ''
    // }
    // })
  },
  methods: {
    getPaypalButtonClass(plan) {
      return '.paypal-' + plan
    },
    purchase(planid, planname, planprice, idx) {
      if (planid === 'free') {
        this.$router.push('/schedule')
      } else {
        this.$router.push('/checkout/purchase' + '?planIDX=' + idx)
      }
    },
    async pay(idx) {
      this.currentPlanID = idx
      if (!this.username) {
        return
      }
      // Free content is a special plan
      if (this.plans[this.currentPlanID].id === 'free') {
        this.$router.push('/')
        return
      }
      // const { paymentMethod, error } = await this.stripe.createPaymentMethod({
      //   type: 'card',
      //   card: this.cardElement,
      //   billing_details: {
      //     email: this.username
      //   }
      // })
      try {
        const resp = await this.$axios.post(
          '/api/properties/' + this.property + '/subscribers/me/purchase',
          JSON.stringify({
            data: {
              id: '123',
              type: 'purchase',
              attributes: {
                store: 'stripe',
                external_entitlement_id: this.plans[this.currentPlanID].id,
                checkout: true,
                email: this.username,
                cancel: false,
                price: this.plans[this.currentPlanID].priceNumber
              }
            }
          })
        )
        this.stripe
          .redirectToCheckout({
            sessionId: resp.data.data.attributes.session_id
          })
          .then(function(result) {})
      } catch (err) {
        this.$showError({
          title: err.response.data.errors[0].title,
          text: err.response.data.errors[0].detail
        })
      }
    }
  }
}
</script>
<style lang="scss">
@import '../../assets/scss/global/_colors.scss';

.entitlements {
  display: flex;
  flex-flow: row wrap;
  align-items: space-between;
  justify-content: flex-start;
  width: 100%;

  .button {
    border-radius: 0;
  }
}
.pricing-container {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-around;
}
.card-container {
  height: 50px;
  margin: 20px;
}
.successText {
  padding: 10px;
  color: white;
  background-color: $darkgreen;
  border-radius: 3px;
}
.single-plan {
  display: flex;
  flex: 0 0 33.333%;
  flex-basis: 0 0 33.333%;
  flex-flow: column;
  align-items: center;
  justify-content: space-between;
  width: 33%;
  min-width: 300px;
  max-width: 400px;
  height: 200px;
  padding: 10px;
  margin: 15px;
  color: black;
  background-color: #fff;
  border: 1px solid black;

  &.emphasis {
    box-shadow: 0 0 5px 3px $accent-color;
  }
  .plan-title {
    margin: 0;
  }
  .plan-description {
    justify-content: center;
    width: 100%;
    margin-top: 10px;

    .description {
      margin-bottom: 5px;
      text-align: center;
    }
  }
  .pricing-area {
    display: flex;
    flex-flow: row;
    justify-content: center;
    width: 100%;
    border-top: 1px solid black;
  }
}
</style>
