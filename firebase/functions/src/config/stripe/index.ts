import * as stripeCredentials from '../../../credentials/stripe_credentials'

export const DEV_CONFIG = {
    STRIPE_PRICE_195: "price_1IaZ4EIhbh0YhdB7jSoMwQ84",
    STRIPE_PRICE_173: "price_1IaZnrIhbh0YhdB7wRhFqJLH",
    STRIPE_PRICE_151: "price_1IaZo4Ihbh0YhdB7gFi5VJyp",
    STRIPE_PRICE_129: "price_1IaZoIIhbh0YhdB7BE5QNu9h",
    STRIPE_PRICE_107: "price_1JJziHIhbh0YhdB79jnlk0NU",
    STRIPE_PRICE_85: "price_1JJziOIhbh0YhdB7C47S098I",
    STRIPE_PRICE_63: "price_1JJziUIhbh0YhdB7dGMa9MKk",
    STRIPE_PRICE_40: "price_1JJzibIhbh0YhdB73R3SEcEH",
    STRIPE_PRICE_20: "price_1JJzigIhbh0YhdB7x2ZXLnE7",
    SEND_INVOICE_ENDPOINT: "https://australia-southeast1-booking-system-6435d.cloudfunctions.net",
    STRIPE_DASHBOARD: "https://dashboard.stripe.com/test",
    API_KEY: stripeCredentials.api_keys.dev_api_key
}

export const PROD_CONFIG = {
    STRIPE_PRICE_195: "term-2-2021",
    STRIPE_PRICE_173: "price_1IaZl6Ihbh0YhdB785gfNjb8",
    STRIPE_PRICE_151: "price_1IaZlNIhbh0YhdB70msuSsMo",
    STRIPE_PRICE_129: "price_1IaZlcIhbh0YhdB77sWCAkar",
    STRIPE_PRICE_107: "price_1JJzcZIhbh0YhdB7luWHB2VJ",
    STRIPE_PRICE_85: "price_1JJzcqIhbh0YhdB7IsgWt4uI",
    STRIPE_PRICE_63: "price_1JJzd1Ihbh0YhdB7prf9a6bZ",
    STRIPE_PRICE_40: "price_1JJzgRIhbh0YhdB78RQfQrJz",
    STRIPE_PRICE_20: "price_1JJzgXIhbh0YhdB7epXLTNgX",
    SEND_INVOICE_ENDPOINT: "https://australia-southeast1-bookings-prod.cloudfunctions.net",
    STRIPE_DASHBOARD: "https://dashboard.stripe.com",
    API_KEY: stripeCredentials.api_keys.live_api_key
}