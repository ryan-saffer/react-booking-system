export type PFProduct = { SKU: string; quantity: number }

export type Questions = {
    id: string
    location: string
    parent_first_name: string
    parent_last_name: string
    child_name: string
    child_age: string
    number_of_children_in_store: string
    number_of_children_mobile: string
    glam_creations: PFProduct[]
    science_creations: PFProduct[]
    slime_creations: PFProduct[]
    safari_creations: PFProduct[]
    unicorn_creations: PFProduct[]
    tie_dye_creations: PFProduct[]
    expert_creations: PFProduct[]
    additions: string[]
    party_packs: PFProduct[]
    fun_facts: string
    questions: string
}

export type PFQuestion<T extends keyof Questions> = {
    title: string
    description: string
    key: string
    custom_key: T
    value: Questions[T]
}
