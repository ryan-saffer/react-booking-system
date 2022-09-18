// https://stackoverflow.com/a/58962072/7870403
export function isObjKey<T>(key: any, obj: T): key is keyof T {
    return key in obj;
}

// https://stackoverflow.com/a/66266530/7870403
export type ValuesAsKeys<T extends Record<any, PropertyKey>, NewValue> = Record<T[keyof T], NewValue>