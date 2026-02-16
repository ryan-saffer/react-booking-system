import { randomUUID } from 'crypto'

import express from 'express'

import {
    getCloudFunctionsDomain,
    getSquareLocationId,
    mapCakeSizeToSquareVariation,
    mapCandleToSquareVariation,
    mapProductToSquareVariation,
    mapServingMethodToSquareVariation,
    mapTakeHomeBagToSquareVariation,
    ObjectKeys,
    PRODUCTS,
    TAKE_HOME_BAGS,
    type PartyForm,
    type ProductType,
    type TakeHomeBagType,
} from 'fizz-kidz'

import { DatabaseClient } from '@/firebase/DatabaseClient'
import { env } from '@/init'
import { PaperformClient, type PaperformSubmission } from '@/paperforms/core/paperform-client'
import { handlePartyFormSubmission } from '@/party-bookings/core/handle-party-form-submission'
import { getOrCreateCustomer } from '@/square/core/get-or-create-customer'
import { SquareClient } from '@/square/core/square-client'
import { logError } from '@/utilities'

import type { InventoryChange } from 'square/api'

const SUCCESS_REDIRECT = 'https://fizzkidz.com.au/form-result?result=success'
const ERROR_REDIRECT = 'https://fizzkidz.com.au/form-result?result=error'

const PARTY_FORM_URL = 'https://4c6karmx.paperform.co'

export const partyFormRedirect = express.Router()

/**
 * Redirect 'https://bookings.fizzkidz.com.au/party-form' to the current party form.
 *
 * This form is sent 2 weeks before the party. They are sent the 'cake-form' when they book.
 *
 * Doing this allows updating the form and customers who were already sent the link can still be sent to the latest form.
 * Previously I had to maintain multiple form handlers and it was messy.
 */
partyFormRedirect.get('/party-form', async (req, res) => {
    const bookingId = req.query.id as string

    const url = await appendQueryParamsToPaperform(bookingId, 'party')

    res.redirect(303, url)
    return
})

/**
 * Redirect 'https://bookings.fizzkidz.com.au/cake-form' to the current cake and take home bags form.
 *
 * This form is available to be filled in from the moment they book.
 * The cake form is the same as the party form with visibility logic enabled based on the 'cake_or_party_form' hidden field.
 */
partyFormRedirect.get('/cake-form', async (req, res) => {
    const bookingId = req.query.id as string

    const url = await appendQueryParamsToPaperform(bookingId, 'cake')

    res.redirect(303, url)
    return
})

/**
 * Given a paperform submission id, it redirects the customer to a Square Payment Link.
 *
 * Party form has custom redirect rules setup to decide whether or not to send this customer to this link.
 * When creating the payment link, it will setup '/party-form/form-complete' as the redirect url.
 */
partyFormRedirect.get('/party-form/payment-link', async (req, res) => {
    const submissionId = req.query.submissionId
    if (!submissionId || typeof submissionId !== 'string') {
        logError('party form submitted for checkout but there was no submissionId', undefined, { requestUrl: req.url })
        res.redirect(303, ERROR_REDIRECT)
        return
    }

    const paperformClient = new PaperformClient()

    let responses: PaperformSubmission<PartyForm>
    try {
        responses = await paperformClient.getPartyFormSubmission(submissionId)
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

    const host = getCloudFunctionsDomain(env, process.env.FUNCTIONS_EMULATOR === 'true')

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
 * Handles the party form submission.
 * Linked to by both the party form directly, or from the Square payment link if payment was required.
 *
 * This route is idempotent based on submissionId.
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

    let responses: PaperformSubmission<PartyForm>
    try {
        responses = await paperformClient.getPartyFormSubmission(submissionId)
    } catch (err) {
        logError(
            `party form submitted for completion but there was an error fetching paperform submission with id: ${submissionId}`,
            err
        )
        res.redirect(303, ERROR_REDIRECT)
        return
    }

    const bookingId = responses.getFieldValue('id')

    // Redirect URLs are not guaranteed to be called exactly once (refresh/back button/timeouts/etc),
    // so we need to guard against processing the same Paperform submission multiple times.
    try {
        const claim = await DatabaseClient.claimPartyFormSubmissionProcessing(submissionId, bookingId)
        if (!claim.shouldProcess) {
            res.redirect(303, claim.status === 'failed' ? ERROR_REDIRECT : SUCCESS_REDIRECT)
            return
        }
    } catch (err) {
        logError('Error claiming party form submission processing lock', err, { submissionId, bookingId })
        res.redirect(303, ERROR_REDIRECT)
        return
    }

    // Square automatically removes tracked inventory quantities.
    // Since these are ordered through the supplier, we don't want to change the inventory levels - so adjust it back here.
    const takeHomeBags = responses.getFieldValue('take_home_bags')
    const products = responses.getFieldValue('products')
    if (takeHomeBags.length > 0 || products.length > 0) {
        const booking = await DatabaseClient.getPartyBooking(bookingId)
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
                bookingId,
                submissionId,
            })
        }
    }

    // Handle the complete form submission (mapping, database updates, emails, etc.)
    try {
        await handlePartyFormSubmission(responses)
    } catch (err) {
        try {
            await DatabaseClient.failPartyFormSubmissionProcessing(submissionId, err)
        } catch (innerErr) {
            logError('Error marking party form submission processing as failed', innerErr, { submissionId, bookingId })
        }
        res.redirect(303, ERROR_REDIRECT)
        return
    }

    try {
        await DatabaseClient.completePartyFormSubmissionProcessing(submissionId)
    } catch (err) {
        // Processing already completed; this is only used to prevent duplicate runs.
        logError('Error marking party form submission processing as completed', err, { submissionId, bookingId })
    }

    res.redirect(303, SUCCESS_REDIRECT)
    return
})

/**
 * Adds required booking information as query params to the party form url.
 *
 * Both the party form and the cake form are actually the exact same paperform, with visibility logic based on the 'party_or_cake_form' hidden field.
 */
async function appendQueryParamsToPaperform(bookingId: string, partyOrCakeForm: 'party' | 'cake') {
    const booking = await DatabaseClient.getPartyBooking(bookingId)

    let url = `${PARTY_FORM_URL}?location=${
        booking.type === 'studio' ? booking.location : 'mobile'
    }&id=${bookingId}&party_or_cake_form=${partyOrCakeForm}`

    const cake = booking.cake
        ? [
              booking.cake.selection,
              `Size: ${booking.cake.size}`,
              `Flavours: ${booking.cake.flavours.join(', ')}`,
              `How to serve: ${booking.cake.served}`,
              `Candles: ${booking.cake.candles}`,
              `Message: ${booking.cake.message || 'No message'}`,
          ].join('\n')
        : ''

    const takeHomeBags = ObjectKeys(booking.takeHomeBags || {})
        .map((key) => {
            const amount = booking.takeHomeBags?.[key]
            if (amount) return `${amount} ${TAKE_HOME_BAGS[key].displayValue}`
        })
        .join('\n')

    const products = ObjectKeys(booking.products || {})
        .map((key) => {
            const amount = booking.products?.[key]
            if (amount) return `${amount} ${PRODUCTS[key].displayValue}s`
        })
        .join('\n')

    const encodedParams: { [key: string]: string } = {
        parent_first_name: encodeURIComponent(booking.parentFirstName),
        parent_last_name: encodeURIComponent(booking.parentLastName),
        child_name: encodeURIComponent(booking.childName),
        child_age: encodeURIComponent(booking.childAge),
        food_package: booking.includesFood
            ? encodeURIComponent('Include the food package')
            : encodeURIComponent('I will self-cater the party'),
        cake_purchased: encodeURIComponent(cake),
        take_home_bags_purchased: encodeURIComponent([takeHomeBags, products].join('\n')),
    }

    Object.keys(encodedParams).forEach((key) => (url += `&${key}=${encodedParams[key]}`))

    return url
}
