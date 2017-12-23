import { Integration } from "./models/integration";

export class SessionStorage {

    public static scalarToken: string;
    public static userId: string;
    public static roomId: string;
    public static editIntegration: Integration;
    public static editIntegrationId: string;
    public static editsRequested: number = 0;

    private constructor() {
    }
}