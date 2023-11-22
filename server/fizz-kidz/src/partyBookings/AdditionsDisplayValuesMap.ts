import { Additions } from './Additions'

export type AdditionsKeyMap = { [key in keyof typeof Additions]: string }

export const AdditionsDisplayValuesMap: AdditionsKeyMap = {
    [Additions.chickenNuggets]: 'Chicken Nuggets',
    [Additions.fairyBread]: 'Fairy Bread',
    [Additions.fruitPlatter]: 'Fruit Platter',
    [Additions.frankfurts]: 'Frankfurts',
    [Additions.sandwichPlatter]: 'Sandwich Platter',
    [Additions.veggiePlatter]: 'Veggie Platter',
    [Additions.vegetarianQuiche]: 'Vegetarian Quiches',
    [Additions.watermelonPlatter]: 'Watermelon Platter',
    [Additions.wedges]: 'Wedges',
    [Additions.lollyBags]: 'Lolly bags',
    [Additions.grazingPlatterMedium]: 'Medium Grazing Platter',
    [Additions.grazingPlatterLarge]: 'Large Grazing Platter',
    [Additions.volcanoPartyPack]: 'Volcano Party Pack',
    [Additions.dinosaurBathBombPartyPack]: 'Dinosaur Bath Bomb Party Pack',
    [Additions.lipBalmPartyPack]: 'Lip Balm Party Pack',
    [Additions.slimePartyPack]: 'Slime Party Pack',
}
