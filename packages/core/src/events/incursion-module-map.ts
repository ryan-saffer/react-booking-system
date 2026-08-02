export const ModuleNameMap = {
    'radical-reactions-f-2': 'Radical Reactions (F-2)',
    'radical-reactions-3-6': 'Radical Reactions (3-6)',
    'marvellous-matter-3-6': 'Marvellous Matter (3-6)',
    'fabulous-forces-f-2': 'Fabulous Forces (F-2)',
    'fabulous-forces-3-6': 'Fabulous Forces (3-6)',
    'electrifying-electricity-3-6': 'Electrifying Electricity (3-6)',
    'light-and-sound-f-2': 'Light and Sound (F-2)',
    'wild-and-wacky-weather-f-2': 'Wild and Wacky Weather (F-2)',
    'living-things-f-2': 'Living Things (F-2)',
    'sustainability-superpowers-f-6': 'Sustainability Superpowers (F-6)',
    'natural-disasters-3-6': 'Natural Disasters (3-6)',
} as const

export type ScienceModule = keyof typeof ModuleNameMap

export const ModuleIncursionMap = {
    'radical-reactions-f-2': 'Chemical Science',
    'radical-reactions-3-6': 'Chemical Science',
    'marvellous-matter-3-6': 'Chemical Science',
    'fabulous-forces-f-2': 'Push and Pull',
    'fabulous-forces-3-6': 'Push and Pull',
    'electrifying-electricity-3-6': 'Light and Sound',
    'light-and-sound-f-2': 'Light and Sound',
    'wild-and-wacky-weather-f-2': 'Earth, Weather and Sustainability',
    'living-things-f-2': 'Earth, Weather and Sustainability',
    'sustainability-superpowers-f-6': 'Earth, Weather and Sustainability',
    'natural-disasters-3-6': 'Earth, Weather and Sustainability',
} as const
