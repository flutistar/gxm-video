<template>
  <div class="payment-form-container card-element">
    <form
      id="payment-form"
      @keydown="$event.keyCode === 13 ? $event.preventDefault() : false"
      @submit.prevent="submit"
      method="post"
    >
      <p class="payment-form-title">Pay with card</p>
      <div class="form-row card-row">
        <p class="payment-form-sub-title">Email</p>
        <input
          :value="username"
          :disabled="true"
          class="field single-input-field"
        />
      </div>
      <div class="form-row card-row">
        <p class="payment-form-sub-title">Card information</p>
        <div id="card-element-card-number" class="field empty"></div>
        <div class="flex-element">
          <div
            id="card-element-card-expiry"
            class="field empty half-width"
          ></div>
          <div id="card-element-card-cvc" class="field empty half-width"></div>
        </div>
        <div id="card-errors" role="alert"></div>
      </div>
      <div v-if="showCoupon">
        <p class="payment-form-sub-title">Promo Code</p>
        <div class="form-row card-row validate-box">
          <input
            v-model="coupon"
            @keyup="couponChange"
            class="field single-input-field field-coupon half-width"
          />
          <button
            v-on:click="validateCoupon"
            type="button"
            class="submit-validate"
          >
            Validate
          </button>
        </div>
      </div>
      <p
        :class="
          validated
            ? 'payment-form-policy payment-form-discount-valid'
            : 'payment-form-policy payment-form-discount-invalid'
        "
      >
        {{ discount }}
      </p>

      <p v-if="loading" class="loading-msg">
        Payment Processing Please Wait ...
      </p>

      <button v-else class="submit-payment">
        Subscribe {{ currentPlanPrice }}
      </button>
      <p class="payment-form-policy">
        By confirming your subscription, you allow Poker Central LLC to charge
        your card for this payment and future payments in accordance with their
        terms.
      </p>
    </form>
  </div>
</template>

<script>
import VueScript2 from 'vue-script2'

const stripeElementStyle = {
  base: {
    fontFamily: 'Uni Sans, Helvetica, Arial, sans-serif',
    cssSrc: '/pokergo/UniSans/fonts.css',
    fontSize: '16px',
    fontWeight: 'normal',
    backgroundColor: 'none', // $black-lighter
    color: '#333',
    '::placeholder': {
      color: '#ccc' // $gray-600
    },
    iconColor: '#ffffff'
  },
  invalid: {
    color: '#ff0000b5' // $primary
  }
}

let stripe
let elements
let cardNumber
let cardExpiry
let cardCvc
let invalidNumber
let invalidExp
let invalidCvc
export default {
  name: 'StripeCardElement',
  data() {
    return {
      valid: true,
      discountDescription: '',
      validated: false,
      coupon: '',
      plans: this.$store.state.property.plans,
      loading: false
    }
  },
  computed: {
    showCoupon() {
      const id = this.$route.query.planIDX
      if (!this.plans.length) {
        return false
      }
      return this.plans[id].type !== 'monthly'
    },
    discount() {
      return this.coupon.length ? this.discountDescription : ''
    },
    promocode() {
      let promo = this.$store.state.property.promocode
      if (promo.length > 0) {
        promo = promo.toUpperCase()
      }
      return promo
    },
    username() {
      return this.$store.state.auth.user.attributes.email
    },
    currentPlanPrice() {
      if (!this.plan) {
        return ''
      }
      return this.validated
        ? this.promoPrice
        : this.plan.price
        ? this.plan.price.split('/')[0]
        : ''
    },
    planIDX() {
      return this.$route.query.planIDX ? this.$route.query.planIDX : ''
    },
    plan() {
      return this.plans[this.planIDX]
    },
    property() {
      return this.$store.state.property.property_id
    }
  },
  async mounted() {
    if (
      !this.plans.length ||
      this.plan === undefined ||
      this.plan.name === '' ||
      this.plan.price === '' ||
      this.plan.id === ''
    ) {
      this.$router.push('/checkout')
    }
    await VueScript2.load('https://js.stripe.com/v3/')
    stripe = window.Stripe(
      process.env.stripe_key || 'pk_test_kbodKK6lY1o02ZI3w9rOw1Ln00JU0YUHjz'
    )
    elements = stripe.elements({
      fonts: [{ cssSrc: 'https://use.typekit.net/wzs6wwk.css' }]
    })

    const elementClasses = {
      focus: 'focus',
      empty: 'empty',
      invalid: 'invalid'
    }

    cardNumber = elements.create('cardNumber', {
      style: stripeElementStyle,
      classes: elementClasses
    })
    cardNumber.mount('#card-element-card-number')

    cardExpiry = elements.create('cardExpiry', {
      style: stripeElementStyle,
      classes: elementClasses
    })
    cardExpiry.mount('#card-element-card-expiry')

    cardCvc = elements.create('cardCvc', {
      style: stripeElementStyle,
      classes: elementClasses
    })
    cardCvc.mount('#card-element-card-cvc')

    cardNumber.on('change', function(event) {
      const displayError = document.getElementById('card-errors')
      if (event.error) {
        invalidNumber = true
        displayError.textContent = event.error.message
      } else {
        invalidNumber = false
        displayError.textContent = ''
      }
    })
    cardExpiry.on('change', function(event) {
      const displayError = document.getElementById('card-errors')
      if (event.error) {
        invalidExp = true
        displayError.textContent = event.error.message
      } else {
        invalidExp = false
        displayError.textContent = ''
      }
    })
    cardCvc.on('change', function(event) {
      const displayError = document.getElementById('card-errors')
      if (event.error) {
        invalidCvc = true
        displayError.textContent = event.error.message
      } else {
        invalidCvc = false
        displayError.textContent = ''
      }
    })
  },
  methods: {
    couponChange(event) {
      const tabKeyPressed = event.keyCode === 9
      if (!tabKeyPressed) {
        this.validated = false
        this.$store.commit('property/setPromoCode', '')
        this.discountDescription = ''
        if (!this.coupon.length) {
          this.valid = true
        } else {
          this.valid = false
        }
      }
    },
    async validateCoupon() {
      if (!this.validated) {
        await this.$axios
          .$post(
            '/api/properties/' +
              this.property +
              '/subscribers/me/promovalidate',
            JSON.stringify({
              Code: this.coupon
            })
          )
          .then((res) => {
            this.promoPrice = res.data.Price
              ? '$' + res.data.Price
              : this.plan.price
              ? this.plan.price.split('/')[0]
              : ''

            if (res.data.Price === 0) {
              this.promoPrice = '$0'
            }
            this.discountDescription = res.data.Description
            if (res.data.Valid) {
              this.$store.commit('property/setPromoCode', this.coupon)
              this.validated = true
            } else {
              this.$store.commit('property/setPromoCode', '')
              this.validated = false
            }
          })
          .catch((err) => {
            this.$showError({
              title: err,
              text: err
            })
          })
      }
    },
    pay(clientSecret) {
      stripe
        .confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardNumber
          }
        })
        .then(function(result) {
          if (result.error) {
            const displayError = document.getElementById('card-errors')
            // displayError.textContent = result.error.message
            console.log(displayError)
          } else {
            this.orderComplete(clientSecret)
          }
        })
    },
    orderComplete(clientSecret) {
      document.querySelector('.sr-payment-form').classList.add('hidden')
      document.querySelector('.sr-result').classList.remove('hidden')
      setTimeout(function() {
        document.querySelector('.sr-result').classList.add('expand')
      }, 200)
    },
    async submit(ignoreErrors) {
      if (invalidNumber || invalidExp || invalidCvc) {
        return
      }

      const details = {}
      const { error, paymentMethod } = await stripe.createPaymentMethod(
        'card',
        cardNumber,
        details
      )
      if (error) {
        if (ignoreErrors && error.code === 'incomplete_number') {
          return error
        } else {
          throw new Error(error.message)
        }
      }
      this.loading = true
      try {
        await this.$axios
          .post(
            '/api/properties/' +
              this.property +
              '/subscribers/me/payment-intent',
            {
              Merchant: 'stripe',
              MerchantPlan: this.plan.stripe_id
            },
            { headers: { 'Content-Type': 'application/vnd.api+json' } }
          )
          .then((result) => {
            this.pay(result.data.data.clientSecret)
          })
          .then(async (paymentIntent) => {
            const externalID = this.plan.stripe_id
            const stripeToken = paymentMethod.id
            const resp = await this.$axios.post(
              '/api/properties/' + this.property + '/subscribers/me/purchase',
              JSON.stringify({
                data: {
                  id: '123',
                  type: 'purchase',
                  attributes: {
                    store: 'stripe',
                    external_entitlement_id: externalID,
                    checkout: true,
                    email: this.username,
                    cancel: false,
                    promocode: this.promocode,
                    payment_id: stripeToken,
                    price: this.plan.priceNumber
                  }
                }
              })
            )
            window.location.replace(resp.data.data.attributes.session_id)
          })
      } catch (err) {
        const displayError = document.getElementById('card-errors')
        const detail = err.response.data.errors[0].detail
        const content = JSON.parse(detail)
        displayError.textContent = content.message
      }

      this.loading = false
    }
  }
}
</script>
<style scoped>
.validate-box {
  display: inline-flex;
}
.validate-box .single-input-field {
  font-weight: normal;
  color: #333 !important;
}
.field.single-input-field {
  border-radius: 4px;
}
.payment-form-sub-title {
  margin-bottom: 5px !important;
  font-size: 16px !important;
  font-weight: bold;
  color: #333333ad;
  text-align: left;
}
#card-element-card-number {
  border-bottom: none;
  border-radius: 5px 5px 0 0 !important;
}
#card-element-card-expiry {
  border-radius: 0 0 0 5px !important;
}
#card-element-card-cvc {
  border-radius: 0 0 5px 0 !important;
}
.flex-element {
  display: inline-flex;
  width: 100%;
}
.payment-form-container {
  width: 90%;
  max-width: 500px;
  margin: 40px auto;
  text-align: center;
  background-color: #fff;
  border-radius: 9px;
}
.loading-msg {
  color: black;
  text-align: center;
}
#payment-form {
  padding: 50px !important;
  background: #fff;
  border-radius: 9px;
}
.payment-form-title {
  font-size: 20px !important;
  font-weight: bold;
  color: #333;
  text-align: left;
}
.payment-form-policy {
  font-size: 0.8em !important;
  color: #ccc;
  text-align: center;
}
.payment-form-discount-invalid {
  color: #ff0000b5 !important;
}
.payment-form-discount-valid {
  color: rgb(15, 185, 13) !important;
}
input {
  color: #ccc !important;
}
#card-element {
  background-color: #44125d61;
}
.form-row {
  width: 100%;
  margin: 10px 0;
}
.StripeElement {
  box-sizing: border-box;
  height: 40px;
  padding: 10px 12px;
  background-color: white;
  border: 1px solid transparent;
  border-radius: 4px;
  box-shadow: 0 1px 3px 0 #e6ebf1;
  -webkit-transition: box-shadow 150ms ease;
  transition: box-shadow 150ms ease;
}

.StripeElement--focus {
  box-shadow: 0 1px 3px 0 #cfd7df;
}

.StripeElement--invalid {
  border-color: #fa755a;
}

.StripeElement--webkit-autofill {
  background-color: #fefde5 !important;
}
.submit-validate {
  margin-left: 10px;
  font-weight: bold;
  color: #fff;
  background-color: #9f26b5;
  border: none;
  border-radius: 5px;
  outline: none;
  box-shadow: 0 0 14px 0 #ca9090;
}
.submit-payment {
  display: inline-block;
  width: 100%;
  max-width: 100%;
  height: 40px;
  margin-bottom: 20px;
  font-weight: bold;
  color: #fff;
  background-color: #9f26b5;
  border: none;
  border-radius: 5px;
  outline: none;
  box-shadow: 0 0 14px 0 #ca9090;
}
.submit-payment:hover,
.submit-payment:active {
  opacity: 0.8;
}
#card-errors {
  height: 20px;
  margin-top: 20px;
  font-size: 0.8em;
  color: #ff0000b5;
  background-color: transparent;
}

.card-element * {
  font-family: Quicksand, Open Sans, Segoe UI, sans-serif;
  font-size: 16px;
  font-weight: 600;
}

.card-element .fieldset {
  display: flex;
  -ms-flex-flow: row wrap;
  flex-flow: row wrap;
  justify-content: space-between;
  padding: 0;
  margin: 0 15px 30px;
  -ms-flex-pack: justify;
  border-style: none;
}

.card-element .field {
  width: 100%;
  padding: 10px 20px 11px;
  border: 1px solid #ccc;
}

.card-element .flex-element .field.half-width {
  width: 50%;
}

.card-element .field.third-width {
  width: calc(33% - (5px / 3));
}

.card-element .field.focus,
.card-element .field:focus {
  color: #424770;
  background-color: #f6f9fc;
}

.card-element .field.invalid.focus {
  background-color: #f6f9fc;
}

.card-element .field.focus::-webkit-input-placeholder,
.card-element .field:focus::-webkit-input-placeholder {
  color: #cfd7df;
}

.card-element .field.focus::-moz-placeholder,
.card-element .field:focus::-moz-placeholder {
  color: #cfd7df;
}

.card-element .field.focus:-ms-input-placeholder,
.card-element .field:focus:-ms-input-placeholder {
  color: #cfd7df;
}

.card-element input,
.card-element button {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border-style: none;
  outline: none;
}

.card-element input {
  color: #fff;
}

.card-element input::-webkit-input-placeholder {
  color: #9bacc8;
}

.card-element input::-moz-placeholder {
  color: #9bacc8;
}

.card-element input:-ms-input-placeholder {
  color: #9bacc8;
}

.card-element button {
  cursor: pointer;
}

.card-element button:active {
  background-color: #f5be58;
}

.card-element .error svg .base {
  fill: #fa755a;
}

.card-element .error svg .glyph {
  fill: #fff;
}

.card-element .error .message {
  color: #fff;
}

.card-element .success .icon .border {
  stroke: #fcd669;
}

.card-element .success .icon .checkmark {
  stroke: #fff;
}

.card-element .success .title {
  color: #fff;
}

.card-element .success .message {
  color: #9cabc8;
}

.card-element .success .reset path {
  fill: #fff;
}
</style>
