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
    requirements?: any; // nullable
    bridgeError: string; // nullable
}

export interface RSSIntegration extends Integration {
    feeds: string[];
    immutableFeeds: {url: string, ownerId: string}[];
}

export interface IRCIntegration extends Integration {
    availableNetworks: {name: string, id: string}[];
    channels: {[networkId: string]: string[]};
}