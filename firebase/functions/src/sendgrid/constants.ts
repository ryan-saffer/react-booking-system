import { Emails } from './types';

export const EmailTemplates: { [key in keyof Emails]: string } = {
    'holidayProgramConfirmation': 'holiday_program_confirmation.html'
}