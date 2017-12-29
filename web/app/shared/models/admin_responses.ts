import { FE_Integration } from "./integration";

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

export interface FE_Upstream {
    id: number;
    name: string;
    type: string;
    scalarUrl: string;
    apiUrl: string;
}

export interface FE_Appservice {
    id: number;
    hsToken: string;
    asToken: string;
    userPrefix: string;
}

export interface FE_NebConfiguration {
    id: number;
    adminUrl?: string;
    appserviceId?: string;
    upstreamId?: string;
    integrations: FE_Integration[];
}