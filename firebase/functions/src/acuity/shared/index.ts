import { Acuity } from 'fizz-kidz'

/**
 * 
 * @param error error communicating with acuity
 * @param object error from acuity
 * @returns 
 */
export function hasError(error: any, object: any | Acuity.Error): object is Acuity.Error {
    return error ? true : isAcuityError(object) ? true : false
}

export function isAcuityError(object: any | Acuity.Error): object is Acuity.Error {
    return (object as Acuity.Error).error !== undefined
}