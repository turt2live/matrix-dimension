export interface Integration {
    type: string;
    integrationType: string;
    userId: string;
    name: string;
    avatar: string;
    about: string; // nullable
    isEnabled: boolean;
    isBroken: boolean;
    hasConfig: boolean;
}

export interface RSSIntegration extends Integration {
    feeds: string[];
    immutableFeeds: {url: string, ownerId: string}[];
}