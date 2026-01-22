import { DateTime } from 'luxon'

import type { Booking } from 'fizz-kidz'
import {
    capitalise,
    getLocationAddress,
    getManager,
    ObjectKeys,
    PRODUCTS,
    TAKE_HOME_BAGS,
    type PartyFormV3,
} from 'fizz-kidz'

import type { PaperformSubmission } from '@/paperforms/core/paperform-client'

import { PartyFormMapperV3 } from './party-form-mapper-v3'
import { getBookingAdditions, getBookingCreations } from './utils.party'
import { DatabaseClient } from '../../firebase/DatabaseClient'
import { env } from '../../init'
import { MixpanelClient } from '../../mixpanel/mixpanel-client'
import { MailClient } from '../../sendgrid/MailClient'
import { logError, throwFunctionsError } from '../../utilities'


export async function handlePartyFormSubmissionV3(responses: PaperformSubmission<PartyFormV3>) {
    const formMapper = new PartyFormMapperV3(responses)
    const existingBooking = await DatabaseClient.getPartyBooking(formMapper.bookingId)

    let mappedBooking: Partial<Booking> = {}
    try {
        mappedBooking = formMapper.mapToBooking(existingBooking.type, existingBooking.location)
        mappedBooking.partyFormFilledIn = true
    } catch (err) {
        logError('error handling party form submission', err, { responses })
        return
    }

    const mailClient = await MailClient.getInstance()

    const takeHomeBags = ObjectKeys(mappedBooking.takeHomeBags || {}).map((key) => ({
        name: TAKE_HOME_BAGS[key].displayValue,
        quantity: mappedBooking.takeHomeBags?.[key]?.toString() || '0',
    }))

    const products = ObjectKeys(mappedBooking.products || {}).map((key) => ({
        name: PRODUCTS[key].displayValue,
        quantity: mappedBooking.products?.[key]?.toString() || '0',
    }))

    // first check if the booking form has been filled in previously
    if (existingBooking.partyFormFilledIn) {
        // form has been filled in before, notify manager of the change
        try {
            await mailClient.sendEmail(
                'partyFormFilledInAgain',
                getManager(mappedBooking.location!, env).email,
                {
                    parentName: `${mappedBooking.parentFirstName} ${mappedBooking.parentLastName}`,
                    parentEmail: existingBooking.parentEmail,
                    parentMobile: existingBooking.parentMobile,
                    childName: mappedBooking.childName!,
                    dateTime: DateTime.fromJSDate(existingBooking.dateTime, {
                        zone: 'Australia/Melbourne',
                    }).toLocaleString({
                        weekday: 'short',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                    }),
                    oldNumberOfKids: existingBooking.numberOfChildren,
                    oldCreations: getBookingCreations(existingBooking),
                    oldAdditions: getBookingAdditions(existingBooking),
                    newNumberOfKids: mappedBooking.numberOfChildren!,
                    newCreations: formMapper.getCreationDisplayValues(existingBooking.type),
                    newAdditions: formMapper.getAdditionDisplayValues(false),
                    oldIncludesFood: existingBooking.includesFood,
                    newIncludesFood: mappedBooking.includesFood!,
                    isMobile: existingBooking.type === 'mobile',
                    ...(existingBooking.cake && {
                        oldCake: {
                            selection: existingBooking.cake.selection,
                            size: existingBooking.cake.size,
                            flavours: existingBooking.cake.flavours.join(', '),
                            served: existingBooking.cake.served,
                            candles: existingBooking.cake.candles,
                            message: existingBooking.cake.message,
                        },
                    }),
                    ...(mappedBooking.cake && {
                        newCake: {
                            selection: mappedBooking.cake.selection,
                            size: mappedBooking.cake.size,
                            flavours: mappedBooking.cake.flavours.join(', '),
                            served: mappedBooking.cake.served,
                            candles: mappedBooking.cake.candles,
                            message: mappedBooking.cake.message,
                        },
                    }),
                    ...(existingBooking.takeHomeBags && {
                        oldTakeHomeBags: ObjectKeys(existingBooking.takeHomeBags || {}).map((key) => ({
                            name: TAKE_HOME_BAGS[key].displayValue,
                            quantity: existingBooking.takeHomeBags?.[key]?.toString() || '0',
                        })),
                    }),
                    ...(mappedBooking.takeHomeBags && takeHomeBags),
                    ...(existingBooking.products && {
                        oldProducts: ObjectKeys(existingBooking.products || {}).map((key) => ({
                            name: PRODUCTS[key].displayValue,
                            quantity: existingBooking.products?.[key]?.toString() || '0',
                        })),
                    }),
                    ...(mappedBooking.products && products),
                },
                {
                    subject: `Party form filled in again for ${mappedBooking.parentFirstName} ${mappedBooking.parentLastName}`,
                }
            )
        } catch (err) {
            logError(
                `error sending party form filled in again notificaiton for booking with id: '${formMapper.bookingId}'`,
                err
            )
        }
    }

    // this checks if they have changed their selected food package. if so, alert the manager.
    // this is different to the 'form filled in again' email, since this can trigger even on the first submission.
    if (existingBooking.type === 'studio' && existingBooking.includesFood !== mappedBooking.includesFood) {
        try {
            await mailClient.sendEmail(
                'partyFormFoodPackageChanged',
                getManager(mappedBooking.location!, env).email,
                {
                    parentName: `${mappedBooking.parentFirstName} ${mappedBooking.parentLastName}`,
                    parentEmail: existingBooking.parentEmail,
                    parentMobile: existingBooking.parentMobile,
                    childName: mappedBooking.childName!,
                    dateTime: DateTime.fromJSDate(existingBooking.dateTime, {
                        zone: 'Australia/Melbourne',
                    }).toLocaleString({
                        weekday: 'short',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                    }),
                    oldIncludesFood: existingBooking.includesFood,
                    newIncludesFood: mappedBooking.includesFood!,
                },
                {
                    subject: `Food package has changed for ${mappedBooking.parentFirstName} ${mappedBooking.parentLastName}`,
                }
            )
        } catch (err) {
            logError(
                `error sending food package changed notificaiton for booking with id: '${formMapper.bookingId}'`,
                err
            )
        }
    }

    // MARK: Write to firestore

    // first increment take home bags and products, since we don't want to overwrite previously purchased amounts.
    const mergedBooking = {
        ...mappedBooking,
        takeHomeBags: mergeRecord(ObjectKeys(TAKE_HOME_BAGS), existingBooking.takeHomeBags, mappedBooking.takeHomeBags),
        products: mergeRecord(ObjectKeys(PRODUCTS), existingBooking.products, mappedBooking.products),
    }
    try {
        await DatabaseClient.updatePartyBooking(formMapper.bookingId, mergedBooking)
    } catch (err) {
        logError('error updating party booking', err, mappedBooking)
        throwFunctionsError('internal', 'error updating party booking', err, mappedBooking)
    }

    const fullBooking = await DatabaseClient.getPartyBooking(formMapper.bookingId)

    // if its a two creation party, but they picked three or more creations, notify manager (or if they picked more than 3 creations)
    const creations = formMapper.getCreationDisplayValues(existingBooking.type)
    const choseThreeCreations = creations.length === 3
    const requiresTwoCreations =
        (fullBooking.type === 'mobile' && fullBooking.partyLength === '1') ||
        (fullBooking.type !== 'mobile' && fullBooking.partyLength === '1.5')

    if ((choseThreeCreations && requiresTwoCreations) || creations.length > 3) {
        try {
            await mailClient.sendEmail(
                'tooManyCreationsChosen',
                getManager(fullBooking.location, env).email,
                {
                    parentName: `${fullBooking.parentFirstName} ${fullBooking.parentLastName}`,
                    parentEmail: fullBooking.parentEmail,
                    parentMobile: fullBooking.parentMobile,
                    childName: fullBooking.childName,
                    dateTime: DateTime.fromJSDate(existingBooking.dateTime, {
                        zone: 'Australia/Melbourne',
                    }).toLocaleString({
                        weekday: 'short',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                    }),
                    chosenCreations: formMapper.getCreationDisplayValues(existingBooking.type),
                },
                {
                    replyTo: fullBooking.parentEmail,
                }
            )
        } catch (err) {
            logError(
                `error sending too many creations notification for booking with id: '${formMapper.bookingId}'`,
                err
            )
        }
    }

    const manager = getManager(fullBooking.location, env)

    if (fullBooking.questions) {
        try {
            await mailClient.sendEmail(
                'partyFormQuestions',
                manager.email,
                {
                    dateTime: DateTime.fromJSDate(existingBooking.dateTime, {
                        zone: 'Australia/Melbourne',
                    }).toLocaleString({
                        weekday: 'short',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                    }),
                    location: capitalise(fullBooking.location),
                    parentName: `${fullBooking.parentFirstName} ${fullBooking.parentLastName}`,
                    childName: fullBooking.childName,
                    questions: fullBooking.questions,
                    parentEmail: fullBooking.parentEmail,
                },
                {
                    replyTo: fullBooking.parentEmail,
                }
            )
        } catch (err) {
            logError(
                `error sending party form questions notification for booking with id: '${formMapper.bookingId}'`,
                err
            )
        }
    }

    // Grazing platter email not migrated from apps script - need to do if we ever bring them back

    const additions = formMapper.getAdditionDisplayValues(true)

    const partyPacks = additions.filter((addition) => addition.includes('Party Pack'))
    if (partyPacks.length !== 0) {
        try {
            await mailClient.sendEmail(
                'partyPackNotification',
                manager.email,
                {
                    parentName: `${fullBooking.parentFirstName} ${fullBooking.parentLastName}`,
                    dateTime: DateTime.fromJSDate(existingBooking.dateTime, {
                        zone: 'Australia/Melbourne',
                    }).toLocaleString({
                        weekday: 'short',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                    }),
                    location: capitalise(fullBooking.location),
                    mobile: fullBooking.parentMobile,
                    email: fullBooking.parentEmail,
                    partyPacks,
                },
                {
                    replyTo: fullBooking.parentEmail,
                }
            )
        } catch (err) {
            logError(`error sending party pack notification for booking with id: '${formMapper.bookingId}'`, err)
        }
    }

    const orderedTakeHomeBags = Object.keys(mappedBooking.takeHomeBags || {}).length > 0
    const orderedProducts = Object.keys(mappedBooking.products || {}).length > 0

    if (orderedTakeHomeBags || orderedProducts) {
        try {
            await mailClient.sendEmail(
                'takeHomeNotification',
                manager.email,
                {
                    parentName: `${fullBooking.parentFirstName} ${fullBooking.parentLastName}`,
                    dateTime: DateTime.fromJSDate(existingBooking.dateTime, {
                        zone: 'Australia/Melbourne',
                    }).toLocaleString({
                        weekday: 'short',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                    }),
                    location: capitalise(fullBooking.location),
                    mobile: fullBooking.parentMobile,
                    email: fullBooking.parentEmail,
                    ...(takeHomeBags.length > 0 && { takeHomeBags }),
                    ...(products.length > 0 && { products }),
                },
                {
                    replyTo: fullBooking.parentEmail,
                }
            )
        } catch (err) {
            logError(`error sending take home notification for booking with id: '${formMapper.bookingId}'`, err)
        }
    }

    // email the cake company if a cake was chosen
    if (mappedBooking.cake) {
        try {
            await mailClient.sendEmail(
                'cakeNotification',
                env === 'prod' ? 'orders@birthdaycakeshop.com.au' : 'ryansaffer@gmail.com',
                {
                    parentName: fullBooking.parentFirstName,
                    dateTime: DateTime.fromJSDate(existingBooking.dateTime, {
                        zone: 'Australia/Melbourne',
                    }).toLocaleString({
                        weekday: 'short',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                    }),
                    studio: `${capitalise(fullBooking.location)} - ${getLocationAddress(fullBooking.location)}`,
                    mobile: fullBooking.parentMobile,
                    email: fullBooking.parentEmail,
                    cakeSelection: mappedBooking.cake.selection,
                    cakeSize: mappedBooking.cake.size,
                    cakeFlavours: mappedBooking.cake.flavours.join(', '),
                    cakeServed: mappedBooking.cake.served,
                    cakeCandles: mappedBooking.cake.candles,
                    cakeMessage: mappedBooking.cake.message,
                },
                {
                    bcc: [manager.email, 'bonnie@fizzkidz.com.au'],
                }
            )
        } catch (err) {
            logError(`error sending cake notification email for booking with id: ${formMapper.bookingId}`, err, {
                booking: mappedBooking,
            })
        }
    }

    // email birthday cake shop if new take home bags were ordered
    if (mappedBooking.takeHomeBags && ObjectKeys(mappedBooking.takeHomeBags).length > 0) {
        try {
            await mailClient.sendEmail(
                'takeHomeBagNotification',
                env === 'prod' ? 'orders@birthdaycakeshop.com.au' : 'ryansaffer@gmail.com',
                {
                    parentName: `${fullBooking.parentFirstName} ${fullBooking.parentLastName}`,
                    dateTime: DateTime.fromJSDate(existingBooking.dateTime, {
                        zone: 'Australia/Melbourne',
                    }).toLocaleString({
                        weekday: 'short',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                    }),
                    studio: `${capitalise(fullBooking.location)} - ${getLocationAddress(fullBooking.location)}`,
                    mobile: fullBooking.parentMobile,
                    email: fullBooking.parentEmail,
                    ...(existingBooking.takeHomeBags && {
                        oldTakeHomeBags: ObjectKeys(existingBooking.takeHomeBags).map((key) => ({
                            name: TAKE_HOME_BAGS[key].displayValue,
                            quantity: existingBooking.takeHomeBags?.[key]?.toString() || '0',
                        })),
                    }),
                    newTakeHomeBags: takeHomeBags,
                },
                {
                    bcc: ['bonnie@fizzkidz.com.au'],
                }
            )
        } catch (err) {
            logError(
                `error sending take home bag notification email for booking with id: ${formMapper.bookingId}`,
                err,
                {
                    booking: mappedBooking,
                }
            )
        }
    }

    try {
        await mailClient.sendEmail(
            'partyFormConfirmation',
            fullBooking.parentEmail,
            {
                parentName: fullBooking.parentFirstName,
                numberOfChildren: fullBooking.numberOfChildren,
                creations,
                isTyeDyeParty: creations.find((it) => it.includes('Tie Dye')) !== undefined,
                hasAdditions: additions.length !== 0,
                additions,
                isMobile: fullBooking.type === 'mobile',
                hasQuestions: fullBooking.questions !== '' || fullBooking.questions !== undefined,
                managerName: manager.name,
                managerMobile: manager.mobile,
                includesFood: fullBooking.type === 'studio' && fullBooking.includesFood,
                hasTakeHomeBags: takeHomeBags.length > 0 || products.length > 0,
                takeHomeBags: [...takeHomeBags, ...products],
                ...(fullBooking.cake && {
                    cake: {
                        selection: fullBooking.cake.selection,
                        size: fullBooking.cake.size,
                        flavours: fullBooking.cake.flavours.join(', '),
                        served: fullBooking.cake.served,
                        candles: fullBooking.cake.candles,
                        message: fullBooking.cake.message,
                    },
                }),
            },
            {
                from: {
                    name: 'Fizz Kidz',
                    email: manager.email,
                },
                replyTo: manager.email,
            }
        )
    } catch (err) {
        logError(`error sending party form confirmation email for booking with id: '${formMapper.bookingId}'`, err)
    }

    // analytics
    const mixpanel = await MixpanelClient.getInstance()
    const additionsWithoutPrices = formMapper.getAdditionDisplayValues(false)
    const additionsWithoutPartyPacks = additionsWithoutPrices.filter((addition) => !addition.includes('Party Pack'))
    await mixpanel.track('birthday-party-form-completed', {
        distinct_id: fullBooking.parentEmail,
        type: fullBooking.type,
        location: fullBooking.location,
        creations,
        additions: additionsWithoutPartyPacks,
        orderedPartyPack: partyPacks.length !== 0,
        ...(partyPacks.length > 0 && { partyPack: partyPacks[0] }), // form does not allow multiple selection so only ever one.
        cakeOrdered: !!mappedBooking.cake,
        ...(!!mappedBooking.cake && {
            cakeSelection: fullBooking.cake?.selection,
            cakeFlavours: fullBooking.cake?.flavours,
            cakeServed: fullBooking.cake?.served,
            cakeSize: fullBooking.cake?.size,
            cakeCandles: fullBooking.cake?.candles,
        }),
        takeHomeOrdered: orderedTakeHomeBags || orderedProducts,
        takeHomeItems: [...takeHomeBags, ...products],
    })
}

/**
 * Utilitiy function to merge the count of products/take home bags from existing booking to the mapped booking
 */
function mergeRecord<T extends string>(
    keys: readonly T[],
    existing: Partial<Record<T, number>> | undefined,
    incoming: Partial<Record<T, number>> | undefined
): Partial<Record<T, number>> {
    const merged: Partial<Record<T, number>> = { ...existing }

    keys.forEach((key) => {
        const currentCount = existing?.[key] ?? 0
        const newCount = incoming?.[key] ?? 0

        if (newCount > 0) {
            merged[key] = currentCount + newCount
        } else if (merged[key] === undefined && currentCount > 0) {
            merged[key] = currentCount
        }
    })

    return merged
}
