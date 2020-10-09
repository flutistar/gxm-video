<template>
  <div @click="$emit('no')" class="modal-background">
    <div class="modal-content">
      <div @click.stop class="modal-body">
        <div name="modal-header" class="modal-head">
          <p v-if="text === undefined" class="modal-heading">
            You have unsaved changes. Leave the page without saving them?
          </p>
          <p v-if="text !== undefined" v-html="text" class="modal-heading">
            {{ text }}
          </p>
        </div>
        <div name="">
          <button
            @click.prevent="$emit('yes')"
            class="button is-primary save-button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
export default {
  name: 'GenericModal',
  props: {
    text: {
      type: String,
      required: false,
      default: undefined
    }
  }
}
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
    width: 50%;
    min-width: 400px;
    min-height: 200px;
    overflow: hidden;
    text-align: center;
    background-color: $secondary-color;
    border: 1px solid $primary-color;
    border-radius: 5px;
    .modal-head {
      padding-top: 10px;
    }
    .modal-body {
      width: 90%;
      .modal-header {
        margin-top: 50px;
        margin-right: 10px;
        margin-left: 10px;
      }
      .modal-heading {
        padding-top: 10px;
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
</style>
