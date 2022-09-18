import { Locations } from "../..";
import { ValuesAsKeys } from "../../utilities";

const StoreCalendars: Omit<ValuesAsKeys<typeof Locations, number>, 'mobile'> = {
    balwyn: 3163510,
    essendon: 3723560,
    malvern: 3163508
}

export default StoreCalendars