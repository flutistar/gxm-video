// eslint-disable-next-line no-empty-pattern
export default (ctx, inject) => {
  inject('showError', (value) => {
    if (process.client) {
      window.$nuxt.$notify({
        group: 'messages',
        title: value.title,
        text: value.text,
        type: 'error',
        duration: 20000
      })
    }
  })
  inject('showInfo', (value) => {
    if (process.client) {
      window.$nuxt.$notify({
        group: 'messages',
        title: value.title,
        text: value.text,
        type: 'error',
        duration: 10000
      })
    }
  })
}
