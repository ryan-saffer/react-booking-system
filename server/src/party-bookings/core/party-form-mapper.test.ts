import { deepStrictEqual, strictEqual } from 'assert'

import { describe, it } from 'vite-plus/test'

import type { PartyForm } from 'fizz-kidz'

import { PaperformSubmission } from '@/paperforms/core/paperform-client'

import { PartyFormMapper } from './party-form-mapper'

describe('PartyFormMapper', () => {
    it('treats omitted optional product fields as empty selections', () => {
        const data = {
            aedj8: 'booking-id',
            ntbn: 'geelong',
            '4easc': '12',
            '3jr92': [],
            '232ih': [],
            c2b0a: [],
            '11bcc': [],
            '33djq': [],
            '521dj': [],
            '8taki': [],
            aluov: [],
            '3k06l': [],
            dd2nd: [],
            dt5jp: 'Include the food package',
            '4gus2': [],
            c25bg: 'I will bring my own cake',
        }
        const submission = new PaperformSubmission<PartyForm>(
            {
                results: {
                    submission: {
                        id: 'submission-id',
                        form_id: 'party-form-id',
                        data,
                    },
                },
            },
            {
                id: 'aedj8',
                location: 'ntbn',
                party_or_cake_form: '4o1f1',
                parent_first_name: 'cdj2g',
                parent_last_name: '5jmo6',
                child_name: 'bt3f3',
                child_age: '74i29',
                number_of_children_in_store: '4easc',
                number_of_children_mobile: 'cmvo9',
                glam_creations: '3jr92',
                science_creations: '232ih',
                slime_creations: 'c2b0a',
                fairy_creations: '11bcc',
                fluid_bear_creations: '33djq',
                safari_creations: '521dj',
                unicorn_creations: '8taki',
                tie_dye_creations: 'aluov',
                taylor_swift_creations: '3k06l',
                demon_hunters_creations: 'dd2nd',
                glam_creations_mobile: 'fb056',
                science_creations_mobile: 'cujle',
                slime_creations_mobile: 'fteue',
                fairy_creations_mobile: 'd4ot9',
                fluid_bear_creations_mobile: '4e14i',
                safari_creations_mobile: '4207t',
                unicorn_creations_mobile: 'eujc7',
                tie_dye_creations_mobile: '524v3',
                taylor_swift_creations_mobile: '7fsl7',
                demon_hunters_creations_mobile: '3r8fv',
                food_package: 'dt5jp',
                additions: '4gus2',
                cake: 'c25bg',
                cake_size: '71tq',
                cake_flavours: 'fv2ga',
                cake_served: 'co9q9',
                cake_candles: '752pu',
                cake_message: 'c0md4',
                take_home_bags: 'eak39',
                products: '5n3s1',
                fun_facts: '6s64m',
                questions: '2smd4',
            }
        )

        const booking = new PartyFormMapper(submission).mapToBooking('studio', 'geelong')

        deepStrictEqual(booking.takeHomeBags, {})
        deepStrictEqual(booking.products, {})
        strictEqual(booking.cake, undefined)
    })
})
