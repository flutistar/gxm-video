# gxm-video-web

## Configuring for production

This site uses Wordpress for a static content CMS, Most of the site is server side rendered and depends on access to the Wolfjaw Video API.

- `API_ADDRESS` - The url of the Video Platform to use
- `PROPERTY_ID` - The property id to use with the video platform. EX: `wolfjaw-studios`
- `STRIPE_PUBLIC_API_KEY` - The stripe public api key - you can get this from the stripe dashboard, it is referred to as the publishable key
- `SITE_URL` - the url that the nuxt server (notblazeweb) is running at
- `WORDPRESS_URL` - url of the wordpress site to use as cms for content pages
- `DEVICE_TOKEN` - The token to be used when the user is not logged in
- `SEO_REDIRECT_URL` - The url to redirect the user to when they visit the home page but are not logged in - Defaults to: `SITE_URL`/schedule?login=show
  Additionally, If running in heroku, the following variables should be set:

`HOST` - The host of the webserver, usually `0.0.0.0`
`NPM_CONFIG_PRODUCTION` - `false` see: https://nuxtjs.org/faq/heroku-deployment/
`NODE_ENV` - `production` see: https://nuxtjs.org/faq/heroku-deployment/

**Example Checkout Items**

```json
[
  { "name": "Browse Free Content", "id": "free", "price": "Free" },
  { "name": "Monthy Pass", "id": "plan_GvEP8tvpucJn5d", "price": "$10/month" },
  {
    "name": "Yearly Pass",
    "id": "plan_GvEP8tvpucJn5d",
    "price": "$120/year"
  }
]
```

**How Checkout Items are configured:**

name: Displayed on the top of the checkout box
price: Displayed in the checkout box
id: the _Stripe ID_ to use for the entitlement. if it is set to "free" then the user will be redirected to content when they click the button

## Wordpress config

The static pages are at `/content/slug`. Static pages pull their data from `[WORDPRESS_URL]/?rest_route=/wp/v2/pages&slug=[slug]`

## Build Setup

```bash
# install dependencies
$ npm run install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).
.
