const bookings = require('./src/bookings')
const acuity = require('./src/acuity')

exports.createBooking = bookings.createBooking
exports.updateBooking = bookings.updateBooking
exports.deleteBooking = bookings.deleteBooking
exports.sendOutForms = bookings.sendOutForms

exports.getAppointmentTypes = acuity.getAppointmentTypes
exports.getCalendars = acuity.getCalendars
exports.getClasses = acuity.getClasses
exports.getAppointments = acuity.getAppointments
exports.getLabels = acuity.getLabels
exports.updateLabel = acuity.updateLabel