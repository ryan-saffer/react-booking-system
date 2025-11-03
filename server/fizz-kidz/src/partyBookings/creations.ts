/**
 * Creations NOT OFFERED AT HOME are
 * -
 */

const GLAM_CREATIONS = {
    fairyGlitterSlime: 'Fairy Glitter Slime',
    glitterFacePaint: 'Glitter Face Paint',
    rainbowBathCrystals: 'Rainbow Bath Crystals',
    glitterSoap: 'Glitter Soap',
    lipBalm: 'Sparkling Lip-Balm',
    unicornSoap: 'Unicorn Soap',
    rainbowBathBombs: 'Rainbow Bath Bombs',
    unicornBathCrumble: 'Unicorn Bath Crumble',
    glitterHairGel: 'Glitter Hair Gel',
} as const

const SCIENCE_CREATIONS = {
    jellySoap: 'Jelly Soap',
    dinosaurBathBombs: 'Dinosaur Bath Bombs',
    fluffySlime: 'Fluffy Slime',
    bugsInBathBombs: 'Bugs in Bath Bombs',
    volcanoes: 'Bubbling Volcanoes',
    dinosaurFossils: 'Dinosaur Fossils',
    monsterBrains: 'Monster Brains',
    stringSlime: 'String Slime',
    monsterSlime: 'Monster Slime',
} as const

const SLIME_CREATIONS = {
    fairyGlitterSlime: 'Fairy Glitter Slime',
    birthdayCakeSlime: 'Birthday Cake Slime',
    monsterSlime: 'Monster Slime',
    candySlime: 'Candy Slime',
    unicornCloudSlime: 'Unicorn Cloud Slime',
    fluffySlime: 'Fluffy Slime',
    spidermanSlime: 'Spiderman Slime',
    nutellaSlime: 'Nutella Slime',
    marshmallowSlime: 'Marshmallow Slime',
    swiftieSlime: 'Swiftie Slime',
    rainbowSlime: 'Rainbow Slime',
    frozenSparkleSlime: 'Frozen Sparkle Slime',
    slimeLab: 'Slime Lab',
} as const

const FAIRY_CREATIONS = {
    fairyGlitterSlime: 'Fairy Glitter Slime',
    pixieGlitter: 'Pixie Glitter',
    fairyBracelets: 'Fairy Bracelets',
    fairyLipBalm: 'Fairy Lip Balm',
    fairyWands: 'Fairy Wands',
    unicornSoap: 'Unicorn Soap',
    fairyBathBombs: 'Fairy Bath-Bombs',
    marshmallowSlime: 'Marshmallow Slime',
    fairyHairGel: 'Fairy Hair Gel',
} as const

const FLUID_BEAR_CREATIONS = {
    fluidBears: 'Fluid Bears',
} as const

const SAFARI_CREATIONS = {
    animalSoap: 'Animal Soap',
    monsterSlime: 'Monster Slime',
    sandSlime: 'Sand Slime',
    bugsInBathBombs: 'Bugs in Bath Bombs',
    animalsInSoap: 'Animals in Soap',
    dinosaurFossils: 'Dinosaur Fossils',
    bathBombs: 'Fizzy Bath Bombs',
    volcanoes: 'Bubbling Volcanoes',
} as const

const UNICORN_CREATIONS = {
    fairyWands: 'Fairy Wands',
    lipBalm: 'Sparkling Lip-Balm',
    unicornBathCrumble: 'Unicorn Bath Crumble',
    unicornSoap: 'Unicorn Soap',
    unicornBathBombs: 'Unicorn Bath Bombs',
    unicornCloudSlime: 'Unicorn Cloud Slime',
} as const

const TIE_DYE_CREATIONS = {
    tieDyeToteBags: 'Tie Dye Tote Bags',
    tieDyeSocks: 'Tie Dye Socks',
    tieDyePillow: 'Tie Dye Pillow',
    tieDyeSoap: 'Tie Dye Soap',
    tieDyeScrunchie: 'Tie Dye Scrunchie',
    rainbowBathCrystals: 'Rainbow Bath Crystals',
} as const

const TAYLOR_SWIFT_CREATIONS = {
    speakNowPurpleBathbombs: "'Speak Now' Purple Bath Bombs",
    folkloreButterflySoap: 'Folklore Butterfly Soap',
    friendshipBracelets: 'Friendship Bracelets',
    loverRainbowBathBombs: "'Lover' Rainbow Bath Bombs",
    fearlessGoldSlime: 'Fearless Gold Slime',
    midnightsSlime: 'Midnights Slime',
    red1989LipBalm: 'Red 1989 Lip Balm',
    loverGlitterFacePaint: "'Lover' Glitter Face Paint",
    loverTieDyeScrunchies: "'Lover' Tie Dye Scrunchies",
} as const

const DEMON_HUNTERS_CREATIONS = {
    goldenSlime: 'Golden Slime',
    hendrixGlitterShine: 'Huntrix Glitter Shine',
    wondersticks: 'Wondersticks',
    moonBeamBracelets: 'Moon Beam Bracelets',
    squishiePockets: 'Squishy Pockets',
    starSlayClips: 'Star Slay Clips',
}

const DEPRECATED_CREATIONS = {
    animalsInBathBombs: 'Animals in Bath Bombs',
    bugsInSoap: 'Bugs in Soap',
    butterflySoap: 'Butterfly Soap',
    crunchySlime: 'Crunchy Slime',
    evermoreSlime: 'Evermore Slime',
    expertCrunchySlime: 'Expert Crunchy Slime',
    expertGalaxyBathBombs: 'Expert Galaxy Bath-Bombs',
    expertGalaxySlime: 'Expert Galaxy Slime',
    expertRainbowBathBombs: 'Expert Rainbow Bath-Bombs',
    expertRainbowSlime: 'Expert Rainbow Slime',
    expertRainbowSoap: 'Expert Rainbow Soap',
    expertWatermelonBathBombs: 'Expert Watermelon Bath-Bombs',
    galaxySlime: 'Galaxy Slime',
    galaxySoap: 'Galaxy Soap',
    glitterSlime: 'Glitter Slime',
    goldSlime: 'Gold Slime',
    instantSnowSlime: 'Instant Snow Slime',
    lavaBathCrystals: 'Lava Bath Crystals',
    lavaLamps: 'Lava Lamps',
    magicQuickSand: 'Magic Quick Sand',
    magicSand: 'Magic Sand',
    marbleCrystals: 'Marble Crystals',
    mermaidSugarScrub: 'Mermaid Sugar Scrub',
    perfume: 'Shining Perfume',
    rainbowSoap: 'Rainbow Soap',
    soap: 'Sparkling Soap',
    sugarScrubLipBalm: 'Sugar Lip Scrub',
    unicornBathCrystals: 'Unicorn Bath Crystals',
    unicornBathShimmer: 'Unicorn Bath Shimmer',
    unicornBubbleBath: 'Unicorn Bubble Bath',
    unicornGalaxySlime: 'Unicorn Galaxy Slime',
    unicornGlitterShimmer: 'Unicorn Glitter Shimmer',
    unicornSlime: 'Unicorn Slime',
    wobblyGalaxySoap: 'Wobbly Galaxy Soap',
    wobblySoap: 'Wobbly Soap',
    wobblyStarSoap: 'Wobbly Star Soap',
} as const

export const CREATIONS = {
    ...GLAM_CREATIONS,
    ...SCIENCE_CREATIONS,
    ...SLIME_CREATIONS,
    ...FAIRY_CREATIONS,
    ...FLUID_BEAR_CREATIONS,
    ...SAFARI_CREATIONS,
    ...UNICORN_CREATIONS,
    ...TIE_DYE_CREATIONS,
    ...TAYLOR_SWIFT_CREATIONS,
    ...DEMON_HUNTERS_CREATIONS,
    ...DEPRECATED_CREATIONS,
}

export type Creation = keyof typeof CREATIONS
