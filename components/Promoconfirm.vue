<template>
  <div @click="$emit('no')" class="modal-background">
    <div class="modal-content">
      <div @click.stop class="modal-body">
        <div class="modal-header">
          <p class="modal-heading">{{ heading }} {{ discountDescription }}?</p>
        </div>
        <br />
        <div class="promocode-form">
          <a
            @click.prevent="promoConfirm"
            class="button is-primary save-button promocode-btn"
            >{{ yesValue }}</a
          >
          <a
            @click.prevent="cancelPromoConfirm"
            class="button is-primary save-button promocode-btn"
            >{{ noValue }}</a
          >
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="js">
import Vue from 'vue'

export default Vue.extend({
  name: 'Promoconfirm',

  data() {
      return {
          showPromocodeBox: false,
          heading: "Use promo code and ",
          noValue: "no",
          yesValue: "yes",
          showError: false
      }
  },
  computed: {
      property() {
      return this.$store.state.property.property_id
    },
    discountDescription() {
      return this.$store.state.property.discountDescription
    }
  },
  methods: {
      promoConfirm(){
        this.$emit('yes')
      },
      cancelPromoConfirm(){
          this.$emit('no')
      }
  }
})
</script>
