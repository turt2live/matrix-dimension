import { AllowNull, Column } from "sequelize-typescript";

export interface IHookshotBridgeRecord {
    upstreamId?: number;
    provisionUrl?: string;
    sharedSecret?: string;
    isEnabled: boolean;
}
