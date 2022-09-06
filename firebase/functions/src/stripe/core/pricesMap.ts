import * as StripeConfig from '../../config/stripe'
const stripeConfig = JSON.parse(process.env.FIREBASE_CONFIG).projectId === "bookings-prod" ? StripeConfig.PROD_CONFIG : StripeConfig.DEV_CONFIG

export const PricesMap: { [key: string]: string } = {
    '216': stripeConfig.STRIPE_PRICE_216,
    '192': stripeConfig.STRIPE_PRICE_192,
    '189': stripeConfig.STRIPE_PRICE_189,
    '168': stripeConfig.STRIPE_PRICE_168,
    '147': stripeConfig.STRIPE_PRICE_147,
    '144': stripeConfig.STRIPE_PRICE_144,
    '126': stripeConfig.STRIPE_PRICE_126,
    '120': stripeConfig.STRIPE_PRICE_120,
    '105': stripeConfig.STRIPE_PRICE_105,
    '96': stripeConfig.STRIPE_PRICE_96,
    '84': stripeConfig.STRIPE_PRICE_84,
    '72': stripeConfig.STRIPE_PRICE_72,
    '63': stripeConfig.STRIPE_PRICE_63,
    '48': stripeConfig.STRIPE_PRICE_48,
    '42': stripeConfig.STRIPE_PRICE_42,
    '24': stripeConfig.STRIPE_PRICE_24,
    '21': stripeConfig.STRIPE_PRICE_21
  }