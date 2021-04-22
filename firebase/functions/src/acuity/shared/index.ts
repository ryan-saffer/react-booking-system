import { Acuity } from 'fizz-kidz'

export function isAcuityError(object: any | Acuity.Error): object is Acuity.Error {
    return (object as Acuity.Error).error !== undefined
}