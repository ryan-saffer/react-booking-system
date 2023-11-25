# Package Overview

`fizz-kidz` is a package that holds shared types and utility methods to be used across Firebase and React.

## Types included are:

### Party Bookings

- [`Booking.Domain.Fields`](./src/booking/domain/index.ts) where `date` and `time` are separated into their own fields
- [`Booking.Network.Fields`](./src/booking/network/index.ts) where `dateTime` is merged into a [Firestore Timestamp](https://firebase.google.com/docs/reference/js/firebase.firestore.Timestamp)
- [`Booking.Locations`](./src/booking/locations.ts), [`Booking.Creations`](./src/booking/creations.ts), [`Booking.CreationDisplayValues`](./src/booking/creationDisplayValues.ts) and [`Booking.CakeFlavours`](./src/booking/cakeFlavours.ts)

### Acuity Scheduling

- Constants used to identify Acuity [intake forms](https://help.acuityscheduling.com/hc/en-us/articles/219149377-Client-Intake-Forms-Agreements) and fields along with [utility](./src/acuity/utilities.ts) to help access them

### Google Apps Script

- [Constants](./src/appsscript/index.ts) to identify all available methods that can be called in GAS