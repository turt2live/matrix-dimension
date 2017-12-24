import { Integration } from "./models/integration";

export class SessionStorage {

    public static scalarToken: string;
    public static userId: string;
    public static roomId: string;
    public static isAdmin: boolean;
    public static editIntegration: Integration;
    public static editIntegrationId: string;
    public static editsRequested = 0;

    private constructor() {
    }
}