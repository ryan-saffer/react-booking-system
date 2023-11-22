import { AcuityTypes } from 'fizz-kidz'

/**
 *
 * @param error error communicating with acuity
 * @param object error from acuity
 * @returns
 */
export function hasError(error: any, object: any | AcuityTypes.Api.Error): object is AcuityTypes.Api.Error {
    return error ? true : isAcuityError(object) ? true : false
}

export function isAcuityError(object: any | AcuityTypes.Api.Error): object is AcuityTypes.Api.Error {
    return object.error !== undefined && object.status_code !== undefined && object.message !== undefined
}
