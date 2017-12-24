export interface DimensionConfigResponse {
    admins: string[];
    widgetBlacklist: string[];
    homesever: {
        name: string;
        userId: string;
        federationUrl: string;
    };
}

export interface DimensionVersionResponse {
    version: string;
}