export class Vacations {
    public constructor (
        public vacation_id?: number,
        public description?: string,
        public destination?: string,
        public image?: string,
        public dates?: string,
        public price?: number,
        public followers?: number,
        public followed?: number
    ){}
}