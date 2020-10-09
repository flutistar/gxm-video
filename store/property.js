import UUID from 'uuid'

/* eslint-disable */
// currently initializing sessionId and sessionStart on creation
// but ideally this should be done on login through the onInitSession action
// not sure why the onInitSession action is not detected with this syntax

export const state = () => ({
  property_id: process.env.PROPERTY_ID,
  sessionID: UUID.v4(),
  sessionStart: new Date(),
  default_views: [
    { name: 'home', display: 'Home', route: '/' },
    { name: 'live', display: 'Schedule', route: '/schedule' },
    { name: 'shows', display: 'On Demand', route: '/demand' },
    {
      name: 'highlights',
      display: 'Highlights',
      route: '/highlights',
      requestViewName: 'contributors'
    }
  ],
  loginPageText: '',
  showLoginLogo: false,
  documents: [],
  promocode: '',
  plans: [],
  discountDescription : ''
})

export const actions = {
  async getDocument(context, label) {
    try {
      await this.$axios
        .get(
          '/api/properties/' + context.state.property_id + '/documents/' + label
        )
        .then((resp) => {
          context.commit('setDocument', resp.data)
        })
    } catch (err) {
      this.errorLoading = true
      if (!err.response) {
        this.$showError({
          title: 'Error',
          text: err
        })
        return
      }
      this.$showError({
        title: 'Document not Returned',
        text: err.response.data.errors[0].detail
      })
    }
  },
  onInitSession(context) {
    context.commit('initSession')
  }
}

export const mutations = {
  setDocument(state, data) {
    const label = data.data.attributes.label
    const content = data.data.attributes.content
    if (state.documents.findIndex((item) => item.label === label) === -1) {
      state.documents.push({
        label: label,
        content: content
      })
    }
  },
  initSession(state) {
    state.sessionID = UUID.v4()
    state.sessionStart = new Date()
  },
  setLoginText(state, value) {
    state.loginPageText = value
  },
  showLoginLogo(state, value) {
    state.showLoginLogo = value
  },
  setPromoCode(state, value) {
    state.promocode = value
  },
  setCheckoutPlans(state, value) {
    state.plans = value
  },
  setDiscountDescription(state, value) {
    state.discountDescription = value
  },
}
