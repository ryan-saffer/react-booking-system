import { strictEqual } from 'assert'

import { ANAPHYLAXIS_PLAN_PREFIXES, isValidAnaphylaxisPlanPath } from './anaphylaxis-plan-path'

describe('anaphylaxis plan paths', () => {
    it('accepts each program path only for its configured prefix', () => {
        const holidayPath = 'anaphylaxisPlans/holiday-program-plan.pdf'
        const preschoolPath = 'anaphylaxisPlans/preschool-v2-child-plan.pdf'

        strictEqual(isValidAnaphylaxisPlanPath(holidayPath, ANAPHYLAXIS_PLAN_PREFIXES.HOLIDAY_PROGRAM), true)
        strictEqual(isValidAnaphylaxisPlanPath(holidayPath, ANAPHYLAXIS_PLAN_PREFIXES.PRESCHOOL_PROGRAM_V2), false)
        strictEqual(isValidAnaphylaxisPlanPath(preschoolPath, ANAPHYLAXIS_PLAN_PREFIXES.PRESCHOOL_PROGRAM_V2), true)
        strictEqual(isValidAnaphylaxisPlanPath(preschoolPath, ANAPHYLAXIS_PLAN_PREFIXES.HOLIDAY_PROGRAM), false)
    })

    it('rejects nested and external paths', () => {
        strictEqual(
            isValidAnaphylaxisPlanPath(
                'anaphylaxisPlans/preschool-v2-child-folder/plan.pdf',
                ANAPHYLAXIS_PLAN_PREFIXES.PRESCHOOL_PROGRAM_V2
            ),
            false
        )
        strictEqual(
            isValidAnaphylaxisPlanPath('https://example.com/plan.pdf', ANAPHYLAXIS_PLAN_PREFIXES.HOLIDAY_PROGRAM),
            false
        )
    })
})
