// https://stackoverflow.com/a/51507473
export type FunctionsResult<T> = Omit<firebase.functions.HttpsCallableResult, 'data'> & { data: T }