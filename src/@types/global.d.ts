import { ILoggedInUser } from "../api/security/MatrixSecurity";

declare global {
    namespace Express {
        // tslint:disable-next-line:no-empty-interface
        interface User extends ILoggedInUser {
        }
    }
}