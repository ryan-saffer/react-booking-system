export enum Role {
    // can do anything
    ADMIN = 'ADMIN',
    // read permissions on everything
    BASIC = 'BASIC',
    // can access bookings as read only, with information limited
    RESTRICTED = 'RESTRICTED',
    // can only access payroll
    BOOKKEEPER = 'BOOKKEEPER',
    // fallback for if user has no role
    NONE = 'NONE',
}
