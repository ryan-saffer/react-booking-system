//#region Bookings
import { Location as _Location } from './booking/Location'
import * as Booking from './booking/Booking'
import { Creation as _Creation } from './booking/Creation'
import * as _CreationDisplayValues from './booking/CreationDisplayValuesMap'
import { Addition as _Addition } from './booking/Addition'
import { CakeFlavour as _CakeFlavour } from './booking/CakeFlavour'

export namespace Bookings {
    export import BaseBooking = Booking.BaseBooking
    export import DomainBooking = Booking.DomainBooking
    export import FirestoreBooking = Booking.FirestoreBooking
    export import DomainBookingFields = Booking.DomainBookingFields
    export import Location = _Location
    export import CreationKeyMap = _CreationDisplayValues.CreationKeyMap
    export import CreationDisplayValuesMap = _CreationDisplayValues.CreationDisplayValuesMap
    export import Creation = _Creation
    export import Addition = _Addition
    export import CakeFlavour = _CakeFlavour
}
//#endregion 

//#region Acuity
export * as Acuity from './acuity'
//#endregion

//#region Apps Script
export * as AppsScript from './appsscript'
//#endregion

//#region Science Club
export { RetrieveInvoiceStatusParams, InvoiceStatusWithUrl, InvoiceStatus, SendInvoiceParams } from './scienceclub/invoicing'
//#endregion

//#region Firebase
export { FirebaseFunctions } from './firebase/functions'
//#endregion