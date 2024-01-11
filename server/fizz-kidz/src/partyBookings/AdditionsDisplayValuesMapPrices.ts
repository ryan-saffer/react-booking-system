import { Additions } from './Additions'

export type AdditionsKeyMap = { [key in keyof typeof Additions]: string }

export const AdditionsDisplayValuesMapPrices: AdditionsKeyMap = {
    chickenNuggets: 'Chicken Nuggets - $35',
    fairyBread: 'Fairy Bread - $30',
    glutenFreeFairyBread: 'Gluten Free Fairy Bread - $40',
    fruitPlatter: 'Fruit Platter - $45',
    frankfurts: 'Frankfurts - $25',
    potatoGems: 'Potato Gems - $30',
    sandwichPlatter: 'Sandwich Platter - butter & cheese, vegemite & butter,  cheese & tomato - $35',
    vegetarianSpringRolls: 'Vegetarian Spring Rolls - $30',
    veggiePlatter: 'Veggie Platter - $30',
    vegetarianQuiche: 'Vegetarian Quiches - $35',
    watermelonPlatter: 'Watermelon Platter - $25',
    wedges: 'Wedges - $30',
    lollyBags: 'Lolly bags - $2.50 per child',
    grazingPlatterMedium: 'Grazing Platter for Parents (Medium: 10-15 ppl) - $98',
    grazingPlatterLarge: 'Grazing Platter for Parents (Large: 15-25 ppl) - $148',
    volcanoPartyPack: 'Bubbling Volcano Activity Party Pack - $15 each',
    dinosaurBathBombPartyPack: 'Dinosaur Bath Bomb Activity Party Pack - $15 each',
    lipBalmPartyPack: 'Sparkling Lip Balm Activity Party Pack - $15 each',
    slimePartyPack: 'Fluffy Slime Activity Party Pack - $15 each',
}
