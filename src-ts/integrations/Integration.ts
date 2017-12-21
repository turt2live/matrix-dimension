import { IntegrationRecord } from "../db/models/IntegrationRecord";

export class Integration {
    // These are meant to be set by the underlying integration
    public category: "bot" | "complex-bot" | "bridge" | "widget";
    public type: string;
    public requirements: IntegrationRequirement[];
    public isEncryptionSupported = false;

    // These are meant to be set by us
    public displayName: string;
    public avatarUrl: string;
    public description: string;
    public isEnabled: boolean;
    public isPublic: boolean;

    constructor(record: IntegrationRecord) {
        this.type = record.type;
        this.displayName = record.name;
        this.avatarUrl = record.avatarUrl;
        this.description = record.description;
        this.isEnabled = record.isEnabled;
        this.isPublic = record.isPublic;
    }
}

export interface IntegrationRequirement {
    condition: "publicRoom" | "canSendEventTypes";
    argument: any;

    // For publicRoom this is true or false (boolean)
    // For canSendEventTypes this is an array of {isState: boolean, type: string}
    // For userInRoom this is the user ID
    expectedValue: any;
}