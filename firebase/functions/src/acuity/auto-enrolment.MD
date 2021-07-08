# Auto Enrolment Flow
Below is a summary of how the auto-enrolment feature works, and what happens at each step.

## Invoicing Dashboard
1. All enrolments into science club automatically place it in the 'free trial' phase (form value for 'continuing with term' is not 'yes')
2. User can send an invoice, which will automatically mark them as continuing with the term, and the 'email sent' field to 'yes'.
3. User can send the enrolment email, which will ask parent to either continue or cancel the term. When sending this email, the 'email sent' form field is set to 'yes'.
4. User can unenroll the user from the term, which will delete their appointment in the series.

## Enrolment Email
### Parent chooses to continue with term
1. Update 'Continuing' form to be 'yes' for all appointments of client
2. Show message that an invoice will be sent to them

### Parent chooses not to continue with term
1. Update 'Continuing' form to be 'no' for all appointments of client
2. Show message that they have been unenrolled from the class