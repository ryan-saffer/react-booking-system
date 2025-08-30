export const TAKE_HOME_BAGS = {
    lollyBags: {
        displayValue: 'Lolly Bags',
        label: 'Lolly Bags',
        helperText: 'Number of lolly bags purchased',
    },
    toyBags: {
        displayValue: 'Toy Bags',
        label: 'Toy Bags',
        helperText: 'Number of toy bags purchased',
    },
} as const

export type TakeHomeBagType = keyof typeof TAKE_HOME_BAGS
