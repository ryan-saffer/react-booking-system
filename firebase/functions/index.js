const bookings = require('./src/bookings')
const acuity = require('./src/acuity')

exports.createBooking = bookings.createBooking
exports.updateBooking = bookings.updateBooking
exports.deleteBooking = bookings.deleteBooking
exports.sendOutForms = bookings.sendOutForms

exports.acuityClient = acuity.acuityClient
exports.sidebar = acuity.sidebar
exports.sendInvoice = acuity.sendInvoice