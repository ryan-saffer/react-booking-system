# Auto Enrolment Flow

## Parent chooses to continue with term
1. Update 'Continuing' form to be 'yes' for all appointments of client
2. Show message that an invoice will be sent to them

## Parent chooses not to continue with term
1. Update 'Continuing' form to be 'no' for all appointments of client
2. Do we unenrol the client from the class..?
3. Show message that they have been unenrolled from the class

## Parent requests a call
1. Updating 'Continuing' form to be 'call' for all appointments of cline
2. Show message that we will contact them

# Issues to consider

## Handling different term lenghts for different schools
If the invoice is automatically sent, it must be the same amount for everyone. Otherwise we will need to store the number of weeks required for each individual school, and needs to be added into calculation when sending the invoice.