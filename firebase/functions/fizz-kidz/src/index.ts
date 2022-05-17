//#region Bookings
export { Additions } from './booking/Additions'
export { CakeFlavours } from './booking/CakeFlavours'
export { Creations } from './booking/Creations'
export { CreationDisplayValuesMap } from './booking/CreationDisplayValuesMap'
export { AdditionsDisplayValuesMapPrices } from './booking/AdditionsDisplayValuesMapPrices'
export { AdditionsDisplayValuesMap } from './booking/AdditionsDisplayValuesMap'
export { Locations } from './booking/Locations'
export { Booking, FormBooking, FirestoreBooking, FormBookingFields, BookingFields } from './booking/Booking'
//#endregion 

//#region Acuity
export * as Acuity from './acuity'
//#endregion

//#region Apps Script
export * as AppsScript from './appsscript'
//#endregion

//#region Science Club
export { RetrieveInvoiceStatusParams, InvoiceStatusWithUrl, InvoiceStatus, SendInvoiceParams, PriceWeekMap } from './scienceclub/invoicing'
//#endregion

//#region Firebase
export { FirebaseFunctions } from './firebase/functions'

import * as result from './firebase/service'
export namespace Types {
    export import Functions = result
}
//#endregion

//#region Utilities
export * as Utilities from './utilities'
//#endregion