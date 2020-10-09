<template>
  <div>
    <div class="page">
      <div class="container">
        <promocode
          v-if="promptPromocode"
          @yes="
            confirm()
            closePrompt(true)
          "
          @no="
            removePromoCode()
            closePrompt(true)
            pay(merchantType, true)
          "
          @return="
            removePromoCode()
            closePrompt(true)
          "
        ></promocode>
        <promoconfirm
          v-if="promptPromoconfirm"
          @yes="
            pay(merchantType, true)
            closePrompt(false)
          "
          @no="
            removePromoCode()
            closePrompt(false)
          "
        ></promoconfirm>
        <div class="selected-pricing-container">
          <div class="selected-single-plan">
            <h3 class="selected-plan-title">{{ currentPlanName }}</h3>
            <div class="selected-plan-description">
              <p class="selected-description">{{ planDescription }}</p>
            </div>
            <div class="selected-pricing-area">
              <h4>{{ currentPlanPrice }}</h4>
            </div>
            <div class="selected-checkout-buttons">
              <div>
                <button @click="pay('stripe', true)" class="button">
                  {{
                    planID === 'free' ? 'Browse' : 'Checkout With Credit Card'
                  }}
                </button>
              </div>
              <div>
                <button
                  @click="pay('paypal', false)"
                  class="button paypal-button"
                >
                  Checkout with paypal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- <button id="submit" @click="" class="button">
              Checkout With Credit Card
            </button>
  <p v-if="success" class="successText">Plan Purchased Successfully</p>-->
</template>
<script>
import Promocode from '@/components/Promocode.vue'
import Promoconfirm from '@/components/Promoconfirm.vue'
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
  components: {
    Promocode,
    Promoconfirm
  },
  data() {
    return {
      promptPromoconfirm: false,
      promptPromocode: false,
      promotionFinished: false,
      merchantType: undefined,
      errors: '',
      errorText: '',
      stripe: undefined,
      paypal: undefined,
      cardElement: undefined,
      currentPlanID: 0,
      plans: this.$store.state.property.plans
    }
  },
  computed: {
    username() {
      return this.$store.state.auth.user.attributes.email
    },
    success() {
      return this.$route.query.success === 'true'
    },
    promocode() {
      let promo = this.$store.state.property.promocode
      if (promo.length > 0) {
        promo = promo.toUpperCase()
      }
      return promo
    },
    property() {
      return this.$store.state.property.property_id
    },
    currentPlanName() {
      if (!this.plan) {
        return ''
      }
      return this.plan.name ? this.plan.name : ''
    },
    currentPlanPrice() {
      if (!this.plan) {
        return ''
      }
      return this.plan.price ? this.plan.price : ''
    },
    emphasisPlan() {
      return this.$route.query.plan ? this.$route.query.plan : ''
    },
    planID() {
      return this.$route.query.planID ? this.$route.query.planID : ''
    },
    planIDX() {
      return this.$route.query.planIDX ? this.$route.query.planIDX : ''
    },
    plan() {
      return this.plans[this.planIDX]
    },
    planDescription() {
      let desc = ''
      this.plans.forEach((element) => {
        if (element.id === this.$route.query.planID) {
          desc = element.description
        }
      })
      return desc
    }
  },
  mounted() {
    if (
      this.plan === undefined ||
      this.plan.name === '' ||
      this.plan.price === '' ||
      this.plan.id === ''
    ) {
      this.$router.push('/checkout')
    }
    this.stripe = window.Stripe(
      process.env.stripe_key || 'pk_test_kbodKK6lY1o02ZI3w9rOw1Ln00JU0YUHjz'
    )
    this.plans = this.$store.state.property.plans
    // window.paypal
    //   .Buttons({
    //     createSubscription(data, actions) {
    //       return actions.subscription.create({
    //         plan_id: this.planID
    //       })
    //     },
    //     onApprove(data, actions) {
    //       alert(
    //         'You have successfully created subscription ' + data.subscriptionID
    //       )
    //     }
    //   })
    //   .render(this.getPaypalButtonClass(this.planID))
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
    back() {
      this.$router.push('/checkout')
    },
    removePromoCode() {
      this.$store.commit('property/setPromoCode', '')
    },
    closePrompt(value) {
      if (value) {
        this.promptPromocode = false
      } else {
        this.promptPromoconfirm = false
      }
    },
    confirm() {
      this.promptPromoconfirm = true
    },
    async pay(store, promoWindow) {
      if (!this.username) {
        return
      }
      this.merchantType = store
      // Free content is a special plan
      if (this.plans[this.planIDX].id === 'free') {
        this.$router.push('/')
        return
      }
      // pop modal for promo code
      if (this.plans[this.planIDX].type !== 'monthly' && !promoWindow) {
        this.promptPromocode = true
        return
      } else {
        this.promptPromocode = false
      }

      if (this.plans[this.planIDX].type === 'monthly') {
        this.removePromoCode()
      }

      const externalID =
        store === 'stripe'
          ? this.plans[this.planIDX].stripe_id
          : this.plans[this.planIDX].paypal_id
      if (store !== 'paypal') {
        this.$router.push('/checkout/stripe?planIDX=' + this.planIDX)
      } else {
        try {
          const resp = await this.$axios.post(
            '/api/properties/' + this.property + '/subscribers/me/purchase',
            JSON.stringify({
              data: {
                id: '123',
                type: 'purchase',
                attributes: {
                  store,
                  external_entitlement_id: externalID,
                  checkout: true,
                  email: this.username,
                  cancel: false,
                  promocode: this.promocode,
                  price: this.plans[this.planIDX].priceNumber
                }
              }
            })
          )
          window.location.replace(resp.data.data.attributes.session_id)
        } catch (err) {
          this.$showError({
            title: err.response.data.errors[0].title,
            text: err.response.data.errors[0].detail
          })
        }
      }
    },
    getPaypalButtonClass(plan) {
      return '.paypal-' + plan
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
.selected-pricing-container {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-around;
  float: left;
  margin-left: 35%;

  @media (max-width: 550px) {
    float: none;
    margin: 0 auto;
  }
}
.card-container {
  width: 100%;
}
.successText {
  padding: 10px;
  color: white;
  background-color: $darkgreen;
  border-radius: 3px;
}
.selected-single-plan {
  display: flex;
  flex: 0 0 25%;
  flex-basis: 0 0 25%;
  flex-flow: column;
  align-items: center;
  justify-content: space-between;
  float: left;
  width: 100%;
  min-width: 400px;
  max-width: 500px;
  height: 300px;
  padding: 10px;
  margin: 15px;
  color: black;
  background-color: #fff;
  border: 1px solid black;

  @media (max-width: 550px) {
    min-width: 300px;
    max-width: 400px;
  }
  &.emphasis {
    box-shadow: 0 0 5px 3px $accent-color;
  }
  .selected-plan-title {
    margin: 0;
  }
  .selected-plan-description {
    justify-content: center;
    width: 100%;
    margin-top: 10px;

    .selected-description {
      margin-bottom: 5px;
      text-align: center;
    }
  }
  .selected-pricing-area {
    display: flex;
    flex-flow: row;
    justify-content: center;
    width: 100%;
    border-top: 1px solid black;
  }
}

.selected-checkout-buttons {
  display: flex;
  flex-flow: column;
  justify-content: space-between;
  min-height: 110px;
  button {
    width: 100%;
  }
}

.paypal-button {
  color: black !important;
  background-color: rgb(247, 197, 87) !important;
  border-color: rgb(247, 197, 87) !important;

  &:hover {
    color: black !important;
    border-color: rgb(247, 197, 87) !important;
  }
}

#selected-paypal-button-div {
  padding-top: 8px;
}
</style>
