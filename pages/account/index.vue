<template>
  <div class="page">
    <div class="container">
      <div class="section">
        <div class="field horizontal apart">
          <h3>Profile</h3>
          <a @click="editName = !editName" href="#">{{
            editName ? 'Cancel' : 'Edit'
          }}</a>
        </div>
        <div v-if="editName" class="field horizontal">
          <div class="field-item">
            <label for="firstname-edit">First Name</label>
            <input
              id="firstname-edit"
              v-model="updatedFirstName"
              tabindex="1"
              type="text"
            />
            <br />
            <button @click="saveNameChange" class="button" tabindex="3">
              Save
            </button>
          </div>
          <div class="field-item">
            <label for="lastname-edit">Last Name</label>
            <input
              id="lastname-edit"
              v-model="updatedLastName"
              tabindex="2"
              type="text"
            />
          </div>
        </div>
        <div class="field horizontal apart">
          <div v-if="!editName">
            <label><strong>Name:</strong></label>
            <p>
              {{ nameChangeSuccess === true ? updatedNameString : nameString }}
            </p>
            <p v-if="nameChangeSuccess === true" class="name-change-notif">
              Name changed successfully.
            </p>
            <label><strong>Email:</strong></label>
            <p>{{ email }}</p>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="field">
          <button
            @click="$router.push('/account/changepassword')"
            class="button"
          >
            Change Password
          </button>
        </div>
      </div>
      <div class="section">
        <h3>
          Subscriptions
        </h3>
        <div v-if="subscriptionsLoading" class="subscription-card">
          <p>
            Subscriptions Loading
          </p>
          <div>
            <!-- <button class="button" disabled>
              Update Payment Method
            </button> -->
            <button disabled class="button">
              Cancel Subscription
            </button>
          </div>
        </div>
        <div
          v-for="entitlementTransactions in entitlementsWithTransactions"
          :key="entitlementTransactions.entitlement.id"
          class="subscription-card"
        >
          <p>
            {{ entitlementTransactions.entitlement.attributes.title }}
            {{
              !ends(entitlementTransactions)
                ? ''
                : '- Ends: ' + getEndDate(entitlementTransactions)
            }}
          </p>
          <p>
            {{
              entitlementTransactions.transaction.attributes.store.toUpperCase()
            }}
          </p>
          <div>
            <!-- <button
              v-if="canCancel(entitlementTransactions)"
              @click="updatePaymentInfo(entitlementTransactions.transaction.id)"
              class="button"
            >
              Update Payment Method
            </button> -->
            <button
              v-if="canCancel(entitlementTransactions)"
              @click="cancel(entitlementTransactions.transaction.attributes)"
              class="button"
            >
              Cancel Subscription
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import moment from 'moment'

export default {
  name: 'AccountPage',
  components: {},
  data() {
    return {
      editName: false,
      userEntitlements: [],
      transactions: [],
      updateCard: false,
      cardDetails: {},
      stripe: undefined,
      transactionsFetched: false,
      entitlementsFetched: false,
      updatedFirstName: '',
      updatedLastName: '',
      nameChangeSuccess: false
    }
  },
  computed: {
    subscriptionsLoading() {
      return !this.transactionsFetched && !this.entitlementsFetched
    },
    firstName() {
      return this.$store.state.auth.user
        ? this.$store.state.auth.user.attributes.first_name
        : ''
    },
    lastName() {
      return this.$store.state.auth.user
        ? this.$store.state.auth.user.attributes.last_name
        : ''
    },
    nameString() {
      return this.firstName + ' ' + this.lastName
    },
    updatedNameString() {
      return this.updatedFirstName + ' ' + this.updatedLastName
    },
    email() {
      return this.$store.state.auth.user
        ? this.$store.state.auth.user.attributes.email
        : ''
    },
    entitlements() {
      return this.$store.state.auth.user
        ? this.$store.state.auth.user.relationships.entitlements.data
        : []
    },
    property() {
      return this.$store.state.property.property_id
    },
    username() {
      return this.$store.state.auth.user
        ? this.$store.state.auth.user.attributes.email
        : ''
    },
    entitlementsWithTransactions() {
      const resp = []
      for (let i = 0; i < this.transactions.length; i++) {
        for (let j = 0; j < this.userEntitlements.length; j++) {
          for (
            let k = 0;
            k < this.userEntitlements[j].attributes.external_product_ids.length;
            k++
          ) {
            if (
              this.transactions[i].attributes.external_product_id ===
              this.userEntitlements[j].attributes.external_product_ids[k]
                .external_id
            ) {
              resp.push({
                entitlement: this.userEntitlements[j],
                transaction: this.transactions[i],
                store: this.transactions[i].attributes.store
              })
            }
          }
        }
      }
      return resp
    }
  },
  async mounted() {
    if (!this.$store.state.auth.user) {
      await this.$router.push('/?login=show')
      return
    }
    this.stripe = window.Stripe(
      process.env.stripe_key || 'pk_test_kbodKK6lY1o02ZI3w9rOw1Ln00JU0YUHjz'
    )
    await Promise.all([this.fetchTransactions(), this.fetchEntitlementData()])
    this.updatedFirstName = this.firstName
    this.updatedLastName = this.lastName
  },
  methods: {
    async fetchPaymentInfo() {
      try {
        const value = await this.$axios.get(
          '/api/properties/' + this.property + '/subscribers/me/paymentinfo'
        )
        this.cardDetails = value.data.data.attributes
      } catch (err) {
        this.$showError({
          title: err.response,
          text: err.response
        })
      }
    },
    async updatePaymentInfo(paymentInfo) {
      try {
        const resp = await this.$axios.post(
          '/api/properties/' +
            this.property +
            '/subscribers/me/updatepaymentinfo',
          JSON.stringify({
            data: {
              id: '123',
              type: 'purchase',
              attributes: {
                store: 'stripe',
                email: this.username,
                transaction_id: paymentInfo
              }
            }
          })
        )
        this.stripe
          .redirectToCheckout({
            sessionId: resp.data.data.attributes.session_id
          })
          .then(function(result) {})
      } catch (err) {}
    },
    canCancel(entitlementTransaction) {
      const receipt = JSON.parse(
        entitlementTransaction.transaction.attributes.receipt
      )
      return (
        (entitlementTransaction.store === 'stripe' &&
          !receipt.cancel_at_period_end) ||
        entitlementTransaction.store === 'paypal'
      ) // we can only cancel stripe subscriptions that have not already been canceled
    },
    ends(entitlementTransaction) {
      const receipt = JSON.parse(
        entitlementTransaction.transaction.attributes.receipt
      )
      return receipt.cancel_at_period_end
    },
    getEndDate(entitlementTransaction) {
      return moment(
        JSON.parse(entitlementTransaction.transaction.attributes.receipt)
          .cancel_at * 1000
      ).format('MM-DD-YYYY')
    },
    async saveNameChange() {
      this.nameChangeSuccess = false
      try {
        await this.$axios.post(
          '/api/properties/' + this.property + '/subscribers/me/change-name',
          {
            data: {
              type: 'password_change',
              attributes: {
                first_name: this.updatedFirstName,
                last_name: this.updatedLastName
              }
            }
          },
          {
            headers: { 'Content-Type': 'application/vnd.api+json' },
            progress: false
          }
        )
        this.editName = false
        this.nameChangeSuccess = true
      } catch (err) {
        this.$showError({ title: err.name, text: err.message })
        this.editName = false
      }
    },
    async fetchTransactions() {
      try {
        const data = await this.$axios.get(
          '/api/properties/' + this.property + '/subscribers/me/transactions'
        )
        this.transactions = data.data.data
      } catch (err) {
        this.$showError({
          title: 'Failed to load transaction data',
          text: err
        })
      }
      this.transactionsFetched = true
    },
    async fetchEntitlementData() {
      try {
        const data = await this.$axios.get('/api/user')
        this.userEntitlements = data.data.included
      } catch (err) {
        this.$showError({
          title: 'Failed to load entitlement data',
          text: err
        })
      }
      this.entitlementsFetched = true
    },
    async cancel(attributes) {
      try {
        let entitlmentID = ''
        const r = JSON.parse(attributes.receipt)
        if (attributes.store === 'stripe') {
          entitlmentID = r.plan.id
        }
        if (attributes.store === 'paypal') {
          entitlmentID = r.plan_id
        }
        await this.$axios.post(
          '/api/properties/' + this.property + '/subscribers/me/purchase',
          JSON.stringify({
            data: {
              id: '123',
              type: 'purchase',
              attributes: {
                store: attributes.store,
                external_entitlement_id: entitlmentID,
                email: this.email,
                payment_id: '',
                cancel: true
              }
            }
          })
        )
      } catch (err) {
        this.$showError({
          title: 'Cancel',
          text: err.response.data.errors[0].detail
        })
      }
      await Promise.all([this.fetchEntitlementData(), this.fetchTransactions()])
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/assets/scss/global/_colors.scss';

.subscription-card {
  display: flex;
  flex-flow: row wrap;
  align-items: baseline;
  justify-content: space-between;
  padding: 20px;
  padding-top: 30px;
  padding-bottom: 30px;
  background-color: $secondary-color-darker;
  border-bottom: 1px solid $primary-color;
  &:last-of-type {
    border-bottom: none;
  }
}

.name-change-notif {
  color: rgb(153, 238, 26);
}

.title {
  font-size: 20px;
}

.field {
  margin-bottom: 10px;
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
</style>
