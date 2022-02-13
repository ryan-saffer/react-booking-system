import * as stripeCredentials from '../../../credentials/stripe_credentials'

export const DEV_CONFIG = {
    STRIPE_PRICE_189: "price_1KSYHoIhbh0YhdB7xf7NwgmH",
    STRIPE_PRICE_168: "price_1KSYGuIhbh0YhdB7SnTK9yFd",
    STRIPE_PRICE_147: "price_1KSYFzIhbh0YhdB7biyNXajN",
    STRIPE_PRICE_126: "price_1KSYFfIhbh0YhdB7ux5w2kJe",
    STRIPE_PRICE_105: "price_1KSYEyIhbh0YhdB7yM6Oee4M",
    STRIPE_PRICE_84: "price_1KSYEjIhbh0YhdB7DdVtCjQV",
    STRIPE_PRICE_63: "price_1JJziUIhbh0YhdB7dGMa9MKk",
    STRIPE_PRICE_42: "price_1KSYClIhbh0YhdB7cGdYEg8x",
    STRIPE_PRICE_21: "price_1KSYCOIhbh0YhdB7pxRAHcsb",
    SEND_INVOICE_ENDPOINT: "https://australia-southeast1-booking-system-6435d.cloudfunctions.net",
    STRIPE_DASHBOARD: "https://dashboard.stripe.com/test",
    API_KEY: stripeCredentials.api_keys.dev_api_key
}

export const PROD_CONFIG = {
    STRIPE_PRICE_189: "price_1KSZJQIhbh0YhdB7lL5gmnWM",
    STRIPE_PRICE_168: "price_1KSZJKIhbh0YhdB7kD6vyjgT",
    STRIPE_PRICE_147: "price_1KSZJEIhbh0YhdB7AfxCPTMj",
    STRIPE_PRICE_126: "price_1KSZJ7Ihbh0YhdB70zK3oQ1V",
    STRIPE_PRICE_105: "price_1KSZJ0Ihbh0YhdB78DWcHD3d",
    STRIPE_PRICE_84: "price_1KSZItIhbh0YhdB7ATYrmjNV",
    STRIPE_PRICE_63: "price_1JJzd1Ihbh0YhdB7prf9a6bZ",
    STRIPE_PRICE_42: "price_1KSZImIhbh0YhdB7bR92U9Qp",
    STRIPE_PRICE_21: "price_1KSZIhIhbh0YhdB7493hllHb",
    SEND_INVOICE_ENDPOINT: "https://australia-southeast1-bookings-prod.cloudfunctions.net",
    STRIPE_DASHBOARD: "https://dashboard.stripe.com",
    API_KEY: stripeCredentials.api_keys.live_api_key
}