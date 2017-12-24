export interface FE_DimensionConfig {
    admins: string[];
    widgetBlacklist: string[];
    homesever: {
        name: string;
        userId: string;
        federationUrl: string;
    };
}

export interface FE_DimensionVersion {
    version: string;
}