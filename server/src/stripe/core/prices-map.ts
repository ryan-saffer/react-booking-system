import * as StripeConfig from '../../config/stripe'
const stripeConfig =
    JSON.parse(process.env.FIREBASE_CONFIG).projectId === 'bookings-prod'
        ? StripeConfig.PROD_CONFIG
        : StripeConfig.DEV_CONFIG

export const PricesMap: { [key: string]: string } = {
    '234': stripeConfig.STRIPE_PRICE_234,
    '216': stripeConfig.STRIPE_PRICE_216,
    '208': stripeConfig.STRIPE_PRICE_208,
    '192': stripeConfig.STRIPE_PRICE_192,
    '189': stripeConfig.STRIPE_PRICE_189,
    '182': stripeConfig.STRIPE_PRICE_182,
    '168': stripeConfig.STRIPE_PRICE_168,
    '156': stripeConfig.STRIPE_PRICE_156,
    '147': stripeConfig.STRIPE_PRICE_147,
    '144': stripeConfig.STRIPE_PRICE_144,
    '130': stripeConfig.STRIPE_PRICE_130,
    '126': stripeConfig.STRIPE_PRICE_126,
    '120': stripeConfig.STRIPE_PRICE_120,
    '105': stripeConfig.STRIPE_PRICE_105,
    '104': stripeConfig.STRIPE_PRICE_104,
    '96': stripeConfig.STRIPE_PRICE_96,
    '84': stripeConfig.STRIPE_PRICE_84,
    '78': stripeConfig.STRIPE_PRICE_78,
    '72': stripeConfig.STRIPE_PRICE_72,
    '63': stripeConfig.STRIPE_PRICE_63,
    '52': stripeConfig.STRIPE_PRICE_52,
    '48': stripeConfig.STRIPE_PRICE_48,
    '42': stripeConfig.STRIPE_PRICE_42,
    '26': stripeConfig.STRIPE_PRICE_26,
    '24': stripeConfig.STRIPE_PRICE_24,
    '21': stripeConfig.STRIPE_PRICE_21,
}
