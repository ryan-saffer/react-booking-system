export enum Location {
    BALWYN = 'balwyn',
    CHELTENHAM = 'cheltenham',
    ESSENDON = 'essendon',
    KINGSVILLE = 'kingsville',
    MALVERN = 'malvern',
}

export type LocationOrMaster = Location | 'master'

export type LocationOrTest = Location | 'test'
