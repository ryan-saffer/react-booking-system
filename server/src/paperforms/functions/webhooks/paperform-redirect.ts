import express from 'express'
import {
    getCloudFunctionsDomain,
    getFunctionEmulatorDomain,
    getSquareLocationId,
    mapCakeSizeToSquareVariation,
    mapCandleToSquareVariation,
    mapProductToSquareVariation,
    mapServingMethodToSquareVariation,
    mapTakeHomeBagToSquareVariation,
    type PartyFormV3,
    type ProductType,
    type TakeHomeBagType,
} from 'fizz-kidz'

import { DatabaseClient } from '@/firebase/DatabaseClient'
import { env } from '@/init'
import { PaperformClient, type PaperformSubmission } from '@/paperforms/core/paperform-client'
import { handlePartyFormSubmissionV3 } from '@/party-bookings/core/handle-party-form-submission-v3'
import { getOrCreateCustomer } from '@/square/core/get-or-create-customer'
import { SquareClient } from '@/square/core/square-client'
import { logError } from '@/utilities'
import { randomUUID } from 'crypto'
import type { InventoryChange } from 'square/api'

const SUCCESS_REDIRECT = 'https://fizzkidz.com.au/form-result?result=success'
const ERROR_REDIRECT = 'https://fizzkidz.com.au/form-result?result=error'

export const partyFormRedirect = express.Router()

// Route used conditionally in Paperform if the customer selected a product.
partyFormRedirect.get('/party-form/payment-link', async (req, res) => {
    const submissionId = req.query.submissionId
    if (!submissionId || typeof submissionId !== 'string') {
        logError('party form submitted for checkout but there was no submissionId', undefined, { requestUrl: req.url })
        res.redirect(303, ERROR_REDIRECT)
        return
    }

    const paperformClient = new PaperformClient()

    let responses: PaperformSubmission<PartyFormV3>
    try {
        responses = await paperformClient.getPartyFormSubmissionV3(submissionId)
    } catch (err) {
        logError(
            `party form submitted for checkout but there was an error fetching paperform submission with id: ${submissionId}`,
            err
        )
        res.redirect(303, ERROR_REDIRECT)
        return
    }

    const booking = await DatabaseClient.getPartyBooking(responses.getFieldValue('id'))

    const cake = responses.getFieldValue('cake')
    const cakeSize = responses.getFieldValue('cake_size')
    const cakeServing = responses.getFieldValue('cake_served')
    const cakeCandles = responses.getFieldValue('cake_candles')

    const takeHomeBags = responses.getFieldValue('take_home_bags')
    const products = responses.getFieldValue('products')

    const host =
        process.env.FUNCTIONS_EMULATOR === 'true'
            ? `https://${req.get('host')}/${getFunctionEmulatorDomain(env, false)}`
            : getCloudFunctionsDomain(env)

    const orderedCake = cake !== 'I will bring my own cake'

    if (!orderedCake && takeHomeBags.length === 0 && products.length === 0) {
        // should not be in checkout flow. redirect to form-complete.
        res.redirect(303, `${host}/api/api/webhooks/party-form/form-complete?submissionId=${submissionId}`)
        return
    }

    try {
        const square = await SquareClient.getInstance()
        const locationId = getSquareLocationId(env === 'prod' ? booking.location : 'test')

        const customerId = await getOrCreateCustomer(
            responses.getFieldValue('parent_first_name'),
            responses.getFieldValue('parent_last_name'),
            booking.parentEmail
        )

        // Create payment link using checkout API
        const { paymentLink } = await square.checkout.paymentLinks.create({
            idempotencyKey: crypto.randomUUID(),
            description: 'Party Form Checkout',
            checkoutOptions: {
                allowTipping: false,
                askForShippingAddress: false,
                merchantSupportEmail: 'bookings@fizzkidz.com.au',
                redirectUrl: `${host}/api/api/webhooks/party-form/form-complete?submissionId=${submissionId}`,
            },
            prePopulatedData: {
                buyerEmail: booking.parentEmail,
            },
            order: {
                locationId,
                customerId,
                source: {
                    name: 'Party Form',
                },
                pricingOptions: {
                    autoApplyDiscounts: true,
                },
                lineItems: [
                    ...(orderedCake
                        ? [
                              {
                                  quantity: '1',
                                  name: cake,
                                  catalogObjectId: mapCakeSizeToSquareVariation(env, cakeSize),
                                  modifiers: [
                                      {
                                          catalogObjectId: mapServingMethodToSquareVariation(env, cakeServing),
                                          quantity: '1',
                                      },
                                      {
                                          catalogObjectId: mapCandleToSquareVariation(env, cakeCandles),
                                          quantity: '1',
                                      },
                                  ],
                              },
                          ]
                        : []),
                    ...takeHomeBags.map((item) => ({
                        quantity: item.quantity.toString(),
                        catalogObjectId: mapTakeHomeBagToSquareVariation(env, item.SKU as TakeHomeBagType),
                    })),
                    ...products.map((item) => ({
                        quantity: item.quantity.toString(),
                        catalogObjectId: mapProductToSquareVariation(env, item.SKU as ProductType),
                    })),
                ],
            },
        })

        if (paymentLink?.url) {
            res.redirect(303, paymentLink.url)
        } else {
            logError(`Payment link is empty for party form with submissionId: ${submissionId}`)
            res.redirect(303, ERROR_REDIRECT)
        }
        return
    } catch (error) {
        logError(`Error creating payment link for party form with submissionId: ${submissionId}`, error)
        res.redirect(303, ERROR_REDIRECT)
        return
    }
})

/**
 * Route for handling post-checkout redirect
 *
 * TODO:
 * It's important that this route is idempotent, since it could get triggered at any point with the same query params.
 * To achieve this, ensure that this submissionId has not been processed before.
 */
partyFormRedirect.get('/party-form/form-complete', async (req, res) => {
    const submissionId = req.query.submissionId
    if (!submissionId || typeof submissionId !== 'string') {
        logError('party form submitted for completion but there was no submissionId', undefined, {
            requestUrl: req.url,
        })
        res.redirect(303, ERROR_REDIRECT)
        return
    }

    const paperformClient = new PaperformClient()

    let responses: PaperformSubmission<PartyFormV3>
    try {
        responses = await paperformClient.getPartyFormSubmissionV3(submissionId)
    } catch (err) {
        logError(
            `party form submitted for completion but there was an error fetching paperform submission with id: ${submissionId}`,
            err
        )
        res.redirect(303, ERROR_REDIRECT)
        return
    }

    // Square automatically removes tracked inventory quantities.
    // Since these are ordered through the supplier, we don't want to change the inventory levels - so adjust it back here.
    const takeHomeBags = responses.getFieldValue('take_home_bags')
    const products = responses.getFieldValue('products')
    if (takeHomeBags.length > 0 || products.length > 0) {
        const booking = await DatabaseClient.getPartyBooking(responses.getFieldValue('id'))
        const locationId = getSquareLocationId(env === 'prod' ? booking.location : 'test')
        const square = await SquareClient.getInstance()
        const takeHomeBagChanges: InventoryChange[] = takeHomeBags.map((item) => ({
            type: 'ADJUSTMENT',
            adjustment: {
                catalogObjectId: mapTakeHomeBagToSquareVariation(env, item.SKU as TakeHomeBagType),
                locationId,
                quantity: item.quantity.toString(),
                fromState: 'NONE',
                toState: 'IN_STOCK',
                occurredAt: new Date().toISOString(),
            },
        }))
        const productsChanges: InventoryChange[] = products.map((product) => ({
            type: 'ADJUSTMENT',
            adjustment: {
                catalogObjectId: mapProductToSquareVariation(env, product.SKU as ProductType),
                locationId,
                quantity: product.quantity.toString(),
                fromState: 'NONE',
                toState: 'IN_STOCK',
                occurredAt: new Date().toISOString(),
            },
        }))
        try {
            await square.inventory.batchCreateChanges({
                idempotencyKey: randomUUID(),
                changes: [...takeHomeBagChanges, ...productsChanges],
            })
        } catch (err) {
            logError('Error adjusting inventory for square item during party form payment', err, {
                bookingId: responses.getFieldValue('id'),
                submissionId,
            })
        }
    }

    // Handle the complete form submission (mapping, database updates, emails, etc.)
    try {
        await handlePartyFormSubmissionV3(responses)
        res.redirect(303, SUCCESS_REDIRECT)
    } catch {
        res.redirect(303, ERROR_REDIRECT)
    }
    return
})
