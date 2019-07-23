import { FE_Integration } from "./models/integration";

export class SessionStorage {

    private static _scalarToken: string;

    public static get scalarToken(): string {
        if (this._scalarToken) return this._scalarToken;
        this.scalarToken = localStorage.getItem("dimension_scalar_token");
        return this._scalarToken;
    }

    public static set scalarToken(val: string) {
        this._scalarToken = val;
        if (val) {
            localStorage.setItem("dimension_scalar_token", val);
        }
    }

    public static userId: string;
    public static roomId: string;
    public static isAdmin: boolean;
    public static editIntegration: FE_Integration;
    public static editIntegrationId: string;
    public static editsRequested = 0;

    private constructor() {
    }
}