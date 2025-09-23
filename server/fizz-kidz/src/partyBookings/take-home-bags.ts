export const TAKE_HOME_BAGS = {
    lollyBags: {
        displayValue: 'Lolly Bags',
        helperText: 'Number of lolly bags purchased',
    },
    toyBags: {
        displayValue: 'Toy Bags',
        helperText: 'Number of toy bags purchased',
    },
    lollyToyMixBags: {
        displayValue: 'Lolly/Toy Mix Bags',
        helperText: 'Number of lolly/toy mix bags purchased',
    },
} as const

export type TakeHomeBagType = keyof typeof TAKE_HOME_BAGS
