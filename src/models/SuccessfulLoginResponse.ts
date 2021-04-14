export class SuccessfulLoginResponse {
    public constructor (
        public token?: string,
        public userType?: string,
        public name?: string,
    ){}
}