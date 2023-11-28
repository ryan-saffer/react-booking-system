// https://stackoverflow.com/a/58962072/7870403
export function isObjKey<T extends object>(key: PropertyKey, obj: T): key is keyof T {
    return key in obj
}

// https://stackoverflow.com/a/66266530/7870403
export type ValuesAsKeys<T extends Record<any, PropertyKey>, NewValue> = Record<T[keyof T], NewValue>

// Fixes the typing of `Object.keys()`
export function ObjectKeys<T extends object>(object: T) {
    return Object.keys(object) as (keyof T)[]
}

export type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>
}

// https://stackoverflow.com/a/57103940/7870403
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never

export type WithoutId<T> = DistributiveOmit<T, 'id'>
export type WithId<T> = T & { id: string }

export * from './businessLogic'
export * from './managerInfo'
export * from './stringUtilities'
