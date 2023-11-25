import { Location } from 'fizz-kidz'

import { useMediaQuery } from '@mui/material'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import * as Utilities from '@utils/stringUtilities'

const LocationCheckboxes = ({
    values,
    handleChange,
}: {
    values: { [key in Location]?: boolean }
    handleChange: (location: Location, checked: boolean) => void
}) => {
    const isMobile = useMediaQuery('(max-width: 460px)')

    return (
        <>
            {Object.values(Location).map((location) => (
                <FormControlLabel
                    key={location}
                    control={
                        <Checkbox
                            id={location}
                            size={isMobile ? 'small' : 'medium'}
                            checked={values[location]}
                            onChange={(e) => handleChange(location, e.target.checked)}
                            value={location}
                            color="secondary"
                        />
                    }
                    label={Utilities.capitalise(location)}
                />
            ))}
        </>
    )
}

export default LocationCheckboxes
