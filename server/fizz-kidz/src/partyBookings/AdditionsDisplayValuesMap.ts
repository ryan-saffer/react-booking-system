import { Additions } from './Additions'

export type AdditionsKeyMap = { [key in keyof typeof Additions]: string }

export const AdditionsDisplayValuesMap: AdditionsKeyMap = {
    [Additions.chickenNuggets]: 'Chicken Nuggets',
    [Additions.fairyBread]: 'Fairy Bread',
    [Additions.glutenFreeFairyBread]: 'Gluten Free Fairy Bread',
    [Additions.fruitPlatter]: 'Fruit Platter',
    [Additions.frankfurts]: 'Frankfurts',
    [Additions.sandwichPlatter]: 'Sandwich Platter',
    [Additions.vegetarianSpringRolls]: 'Vegetarian Spring Rolls',
    [Additions.veggiePlatter]: 'Veggie Platter',
    [Additions.vegetarianQuiche]: 'Vegetarian Quiches',
    [Additions.watermelonPlatter]: 'Watermelon Platter',
    [Additions.wedges]: 'Wedges',
    [Additions.potatoGems]: 'Potato Gems',
    [Additions.lollyBags]: 'Lolly bags',
    [Additions.grazingPlatterMedium]: 'Medium Grazing Platter',
    [Additions.grazingPlatterLarge]: 'Large Grazing Platter',
    [Additions.volcanoPartyPack]: 'Volcano Party Pack',
    [Additions.dinosaurBathBombPartyPack]: 'Dinosaur Bath Bomb Party Pack',
    [Additions.lipBalmPartyPack]: 'Lip Balm Party Pack',
    [Additions.slimePartyPack]: 'Slime Party Pack',
}
