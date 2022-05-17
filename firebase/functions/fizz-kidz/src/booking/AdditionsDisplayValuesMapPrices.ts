import { Additions } from "./Additions";

export type AdditionsKeyMap = { [key in keyof typeof Additions]: string }

export const AdditionsDisplayValuesMapPrices: AdditionsKeyMap = {
    [Additions.chickenNuggets]: "Chicken Nuggets - $35",
    [Additions.fairyBread]: "Fairy Bread - $30",
    [Additions.fruitPlatter]: "Fruit Platter - $45",
    [Additions.sandwichPlatter]: "Sandwich Platter - butter & cheese, vegemite & butter,  cheese & tomato - $35",
    [Additions.veggiePlatter]: "Veggie Platter - $30",
    [Additions.vegetarianQuiche]: "Vegetarian Quiches - $35",
    [Additions.watermelonPlatter]: "Watermelon Platter - $25",
    [Additions.wedges]: "Wedges - $30",
    [Additions.lollyBags]: "Lolly bags - $2.50 per child",
    [Additions.grazingPlatterMedium]: "Grazing Platter for Parents (Medium: 10-15 ppl) - $98",
    [Additions.grazingPlatterLarge]: "Grazing Platter for Parents (Large: 15-25 ppl) - $148",
    [Additions.volcanoPartyPack]: "Bubbling Volcano Activity Party Pack - $15 each",
    [Additions.dinosaurBathBombPartyPack]: "Dinosaur Bath Bomb Activity Party Pack - $15 each",
    [Additions.lipBalmPartyPack]: "Sparkling Lip Balm Activity Party Pack - $15 each",
    [Additions.slimePartyPack]: "Fluffy Slime Activity Party Pack - $15 each"
}