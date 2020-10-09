<template>
  <div @click="$emit('no')" class="modal-background">
    <div class="modal-content">
      <div @click.stop class="modal-body">
        <div class="modal-header">
          <p class="modal-heading">{{ heading }}</p>
        </div>
        <br />
        <div class="promocode-form">
          <input
            v-if="showPromocodeBox"
            v-model="promocode"
            type="text"
            name="promocode"
            class="promocode-text"
          />
          <a
            @click.prevent="promocodeEntry"
            class="button is-primary save-button promocode-btn"
            >{{ yesValue }}</a
          >
          <a
            @click.prevent="cancelPromoEntry"
            class="button is-primary save-button promocode-btn"
            >{{ noValue }}</a
          >
        </div>
        <div v-if="showError" class="error">{{ error }}</div>
      </div>
    </div>
  </div>
</template>
<script lang="js">
import Vue from 'vue'

export default Vue.extend({
  name: 'Promocode',

  data() {
      return {
          showPromocodeBox: false,
          heading: "Do you have a promo code?",
          promocode: "",
          noValue: "no",
          yesValue: "yes",
          error: "Promo code is invalid",
          showError: false
      }
  },
  computed: {
      property() {
      return this.$store.state.property.property_id
    }
  },
  methods: {
      async promocodeEntry(){
          if(!this.showPromocodeBox){
            this.showPromocodeBox = true
            this.heading = "Enter promo code"
            this.yesValue = "Validate"
            this.noValue = "Cancel"
          }else{
            await this.validatePromoEntry()
          }

      },
      cancelPromoEntry(){
        this.promocode = ''
        if (this.noValue === 'no') {
          this.$emit('no')
        } else {
          this.$emit('return')
        }
      },
      async validatePromoEntry(){
          this.showError = false
          await this.$axios.$post(
                '/api/properties/' + this.property + '/subscribers/me/promovalidate',
                 JSON.stringify({
                    Code: this.promocode
                })
            )
            .then((res) => {
                    if (res.data.Valid) {
                      this.$store.commit('property/setDiscountDescription', res.data.Description)
                      this.$store.commit('property/setPromoCode', this.promocode)
                      this.$emit('yes')
                    } else {
                      this.error = res.data.Description
                      this.showError = true
                    }
            })
            .catch((err) => {
                this.showError = true
                console.log(err)
            })



      }

  }
})
</script>
<style lang="scss">
@import '../assets/scss/global/_colors.scss';

.modal-background {
  position: fixed;
  top: 0;
  left: 0;
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
    min-width: 400px;
    max-width: 500px;
    min-height: 200px;
    overflow: hidden;
    text-align: center;
    background-color: $secondary-color;
    border: 1px solid $primary-color;
    border-radius: 5px;

    @media (max-width: 550px) {
      min-width: 300px !important;
      max-width: 400px !important;
    }
    .modal-body {
      width: 100%;

      .modal-header {
        margin-top: 46px;
        margin-right: 10px;
        margin-left: 10px;
      }
      .promocode-form {
        padding: 0 20px 10px 20px;
        .promocode-text {
          margin: 20px 0;
        }
        .promocode-btn {
          margin: 0 10px 10px 10px;
        }
      }
    }
  }
  .error {
    padding: 0 20px 20px 20px;
    color: $red;
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
</style>
