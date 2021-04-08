interface BookingBase {
    PARENT_FIRST_NAME: "parentFirstName",
    PARENT_LAST_NAME: "parentLastName",
    PARENT_EMAIL: "parentEmail",
    PARENT_MOBILE: "parentMobile",
    CHILD_NAME: "childName",
    CHILD_AGE: "childAge",
    LOCATION: "location",
    PARTY_LENGTH: "partyLength",
    ADDRESS: "address",
    NUMBER_OF_CHILDREN: "numberOfChildren",
    NOTES: "notes",
    CREATION_1: "creation1",
    CREATION_2: "creation2",
    CREATION_3: "creation3",
    CAKE: "cake",
    CAKE_FLAVOUR: "cakeFlavour",
    QUESTIONS: "questions",
    FUN_FACTS: "funFacts"
}

export interface BookingFirestore extends BookingBase {
    DATE_TIME: "dateTime"
}

export interface BookingDomain extends BookingBase {
    DATE: "date",
    TIME: "time"
}