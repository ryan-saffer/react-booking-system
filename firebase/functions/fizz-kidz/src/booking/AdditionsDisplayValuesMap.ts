import { Additions } from "./Additions";

export type AdditionsKeyMap = { [key in keyof typeof Additions]: string }

export const AdditionsDisplayValuesMap: AdditionsKeyMap = {
    [Additions.chickenNuggets]: "Chicken Nuggets - $30",
    [Additions.fairyBread]: "Fairy Bread - $25",
    [Additions.fruitPlatter]: "Fruit Platter - $40",
    [Additions.sandwichPlatter]: "Sandwich Platter - butter & cheese, vegemite & butter,  cheese & tomato - $30",
    [Additions.veggiePlatter]: "Veggie Platter - $30",
    [Additions.vegetarianQuiche]: "Vegetarian Quiches - $30",
    [Additions.watermelonPlatter]: "Watermelon Platter - $20",
    [Additions.wedges]: "Wedges - $25",
    [Additions.lollyBags]: "Lolly bags - $2.50 per child",
    [Additions.grazingPlatterMedium]: "Grazing Platter for Parents (Medium: 10-15 ppl) - $98",
    [Additions.grazingPlatterLarge]: "Grazing Platter for Parents (Large: 15-25 ppl) - $148",
    [Additions.volcanoPartyPack]: "Volcano Party Pack",
    [Additions.dinosaurBathBombPartyPack]: "Dinosaur Bath Bomb Party Pack",
    [Additions.lipBalmPartyPack]: "Lip Balm Party Pack",
    [Additions.slimePartyPack]: "Slime Party Pack"
}