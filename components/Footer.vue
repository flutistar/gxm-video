<template>
  <div class="footer">
    <div class="container centered">
      <div class="links">
        <a href="/privacy-policy">Privacy</a>
        <a href="/about">About</a>
        <a href="/terms-and-conditions">Terms and Conditions</a>
        <a href="/faq">FAQ</a>
      </div>
    </div>
    <client-only>
      <cookie-law theme="pokergo"></cookie-law>
    </client-only>
  </div>
</template>
<script>
import CookieLaw from 'vue-cookie-law'
export default {
  name: 'Footer',
  components: { CookieLaw }
}
</script>
<style lang="scss">
@import '../assets/scss/global/_colors.scss';

.Cookie--pokergo {
  padding: 1.25em;
  color: $poker-primary;
  background: #424851;
}

.Cookie--pokergo .Cookie__button {
  padding: 0.625em 3.125em;
  font-size: 1em;
  color: $poker-primary;
  background: $poker-accent;
  border: 0;
  border-radius: 3px;
}

.Cookie--pokergo .Cookie__button:hover {
  color: $poker-accent;
  background: $poker-primary;
}

.footer {
  display: flex;
  flex-flow: row;
  justify-content: center;
  width: 100%;
  height: 300px;
  background-color: $header-bg-darker;
}

.links {
  display: flex;
  flex-flow: row;
  justify-content: space-around;
  width: 400px;

  @media (max-width: 550px) {
    flex-direction: column;
    align-items: center;
    width: 250px;
    a {
      margin-bottom: 8px;
    }
  }
}
</style>
