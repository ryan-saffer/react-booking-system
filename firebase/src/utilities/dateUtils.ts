import { DateTime } from 'luxon'

export function combineDateAndTime(date: DateTime, time: DateTime) {
    return DateTime.fromObject(
        {
            day: date.day,
            month: date.month,
            year: date.year,
            hour: time.hour,
            minute: time.minute,
        },
        { zone: 'Australia/Melbourne' }
    ).toJSDate()
}
