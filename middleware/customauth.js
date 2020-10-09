const excludedPaths = [
  '/',
  '/checkout/purchase',
  '/checkout/stripe',
  '/pages/offer'
]
const routeMapping = []

routeMapping['/'] = process.env.seo_url
routeMapping['/checkout/purchase'] = '/checkout'
routeMapping['/checkout/stripe'] = '/checkout'
routeMapping['/page/offer'] = process.env.seo_url

export default ({ store, route, redirect }) => {
  if (route.path !== route.path.toLowerCase()) {
    redirect(301, route.path.toLowerCase(), route.query)
  } else if (!store.state.auth.loggedIn) {
    if (excludedPaths.includes(route.path)) {
      redirect(
        routeMapping[route.path]
          ? routeMapping[route.path]
          : '/schedule?login=true'
      )
    }
  }
}
