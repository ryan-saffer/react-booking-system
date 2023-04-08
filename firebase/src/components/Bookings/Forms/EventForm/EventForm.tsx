// import { Grid, makeStyles, Typography } from '@material-ui/core'
// import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
// import React, { ChangeEvent, Dispatch, SetStateAction } from 'react'
// import CustomTextField from './CustomTextField'
// import { FormFields } from './FormFields'
// import DateFnsUtils from '@date-io/date-fns'
// import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date'
// import { emailIsInvalid } from '../validation'
// import moment from 'moment'

// type Props = {
//     formValues: FormFields
//     setFormValues: Dispatch<SetStateAction<FormFields>>
//     disabled?: boolean
// }

// export function isFormValid(formValues: FormFields) {
//     let isValid = true

//     const formValuesCopy = { ...formValues } as { [key: string]: any }
//     for (const [key, value] of Object.entries(formValuesCopy)) {
//         if (key !== 'notes' && !value.value) {
//             formValuesCopy[key] = {
//                 ...formValuesCopy[key],
//                 error: true,
//             }
//             isValid = false
//         }
//     }
//     return { isValid, formValuesCopy: formValuesCopy as FormFields }
// }

// export function combineDateAndTime(date: Date, time: string) {
//     const options = { timeZone: 'Australia/Melbourne' }
//     return moment
//         .tz(`${date.toLocaleDateString('en-au', options)} ${time}`, 'DD/MM/YYYY hh:mm', 'Australia/Melbourne')
//         .toDate()
// }

// const EventForm: React.FC<Props> = ({ formValues, setFormValues, disabled }) => {
//     const classes = useStyles()

//     function handleFormChange(field: keyof FormFields, e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
//         const value = e.target.value

//         let error = false
//         let errorText = ''
//         if (field === 'contactEmail') {
//             if (value && emailIsInvalid(value)) {
//                 errorText = 'Email is invalid'
//                 error = true
//             } else {
//                 errorText = 'Contact email cannot be empty'
//             }
//         }
//         setFormValues((values) => ({
//             ...values,
//             [field]: {
//                 ...values[field],
//                 value: value,
//                 error: error || (!value && field !== 'notes'),
//                 errorText: errorText || values[field].errorText,
//             },
//         }))
//     }

//     function handleDateChange(date: MaterialUiPickersDate | null, _value?: string | null) {
//         setFormValues((values) => ({
//             ...values,
//             date: {
//                 ...values['date'],
//                 value: date,
//                 error: false,
//             },
//         }))
//     }

//     return (
//         <>
//             <Grid container spacing={3}>
//                 <Grid item xs={12}>
//                     <Typography variant="h6">Event Details</Typography>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                     <CustomTextField
//                         field="contactName"
//                         label="Contact name"
//                         details={formValues.contactName}
//                         onChange={(e) => handleFormChange('contactName', e)}
//                         disabled={disabled}
//                         classes={{ root: classes.disabled }}
//                     />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                     <CustomTextField
//                         field="contactNumber"
//                         label="Contact number"
//                         details={formValues.contactNumber}
//                         onChange={(e) => handleFormChange('contactNumber', e)}
//                         disabled={disabled}
//                         classes={{ root: classes.disabled }}
//                     />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                     <CustomTextField
//                         field="contactEmail"
//                         label="Contact email"
//                         details={formValues.contactEmail}
//                         onChange={(e) => handleFormChange('contactEmail', e)}
//                         disabled={disabled}
//                         classes={{ root: classes.disabled }}
//                     />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                     <CustomTextField
//                         field="organisation"
//                         label="Organisation / Company name"
//                         details={formValues.organisation}
//                         onChange={(e) => handleFormChange('organisation', e)}
//                         disabled={disabled}
//                         classes={{ root: classes.disabled }}
//                     />
//                 </Grid>
//                 <Grid item xs={12} sm={12}>
//                     <CustomTextField
//                         field="location"
//                         label="Location"
//                         details={formValues.location}
//                         onChange={(e) => handleFormChange('location', e)}
//                         disabled={disabled}
//                         classes={{ root: classes.disabled }}
//                     />
//                 </Grid>
//                 <Grid item xs={12}>
//                     <Typography variant="h6">Date & Time</Typography>
//                 </Grid>
//                 <Grid item xs={12} sm={4}>
//                     <MuiPickersUtilsProvider utils={DateFnsUtils}>
//                         <KeyboardDatePicker
//                             fullWidth
//                             disableToolbar
//                             variant="inline"
//                             format="dd/MM/yyyy"
//                             id="date"
//                             label="Date of event"
//                             autoOk={true}
//                             value={formValues.date.value}
//                             error={formValues.date.error}
//                             helperText={formValues.date.error ? formValues.date.errorText : ''}
//                             onChange={handleDateChange}
//                             KeyboardButtonProps={{
//                                 'aria-label': 'change date',
//                             }}
//                             disabled={disabled}
//                             className={classes.disabled}
//                         />
//                     </MuiPickersUtilsProvider>
//                 </Grid>
//                 <Grid item xs={6} sm={4}>
//                     <CustomTextField
//                         field="startTime"
//                         details={formValues.startTime}
//                         label="Start time"
//                         type="time"
//                         InputLabelProps={{
//                             shrink: true,
//                         }}
//                         inputProps={{
//                             step: 1800, // 5 min
//                         }}
//                         onChange={(e) => handleFormChange('startTime', e)}
//                         disabled={disabled}
//                         classes={{ root: classes.disabled }}
//                     />
//                 </Grid>
//                 <Grid item xs={6} sm={4}>
//                     <CustomTextField
//                         field="endTime"
//                         details={formValues.endTime}
//                         label="End time"
//                         type="time"
//                         InputLabelProps={{
//                             shrink: true,
//                         }}
//                         inputProps={{
//                             step: 1800, // 5 min
//                         }}
//                         onChange={(e) => handleFormChange('endTime', e)}
//                         disabled={disabled}
//                         classes={{ root: classes.disabled }}
//                     />
//                 </Grid>
//                 <Grid item xs={12}>
//                     <Typography variant="h6">Notes</Typography>
//                 </Grid>
//                 <CustomTextField
//                     field="notes"
//                     label="Notes"
//                     details={formValues.notes}
//                     multiline
//                     rows={5}
//                     onChange={(e) => handleFormChange('notes', e)}
//                     disabled={disabled}
//                     classes={{ root: classes.disabled }}
//                 />
//             </Grid>
//         </>
//     )
// }

// const useStyles = makeStyles({
//     disabled: {
//         '& .Mui-disabled': {
//             color: 'rgba(0, 0, 0, 0.87)',
//         },
//     },
// })

// export default EventForm
