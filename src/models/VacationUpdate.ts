export class VacationUpdate {
    public constructor (
        public vacation_id?: number,
        public description?: string,
        public destination?: string,
        public dates?: string,
        public price?: number,
    ){}
}