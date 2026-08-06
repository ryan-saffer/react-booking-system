export enum MixpanelEvents {
    // Science Form
    SCIENCE_FORM_VIEW = 'Science Booking Form - Viewed',
    SCIENCE_FORM_ERROR_LOADING_FORM = 'Science Booking Form - Error Loading Form',
    SCIENCE_FORM_ERROR_SUBMITTING_FORM = 'Science Booking Form - Error Submitting Form',
    SCIENCE_FORM_ENROLMENT_CONFIRMED = 'Science Booking Form - Enrolment Confirmed',
    SCIENCE_FORM_CLASS_FULL = 'Science Booking Form - Error No Spots Left',
    SCIENCE_FORM_NO_CLASSES = 'Science Booking Form - Error No Upcoming Classes',
    SCIENCE_FORM_ERROR_LOADING_CLASSES = 'Science Booking Form - Error Loading Classes',

    // Science Portal
    SCIENCE_PORTAL_VIEW = 'Science Portal - Viewed',
    SCIENCE_PORTAL_ERROR_LOADING = 'Science Portal - Error Loading Portal',
    SCIENCE_PORTAL_ATTENDANCE_TOGGLED = 'Science Portal - Attendance Toggled',
    SCIENCE_PORTAL_ERROR_TOGGLING_ATTENDANCE = 'Science Portal - Error Toggling Attendance',
    SCIENCE_PORTAL_PICKUP_PEOPLE_UPDATED = 'Science Portal - Pickup People Updated',
    SCIENCE_PORTAL_ERROR_UPDATING_PICKUP_PEOPLE = 'Science Portal - Error Updating Pickup People',

    // Science Enrolment
    SCIENCE_ENROLMENT_CONFIRMED = 'Science Enrolment - Confirmed',
    SCIENCE_ENROLMENT_CANCELLED = 'Science Enrolment - Cancelled',
    SCIENCE_ENROLMENT_ERROR = 'Science Enrolment - Error',
}
