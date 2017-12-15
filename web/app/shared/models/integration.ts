export interface Integration {
    // These are from the server
    type: string;
    integrationType: string;
    userId: string;
    name: string;
    avatar: string;
    about: string; // nullable
    supportsEncryptedRooms: boolean;
    requirements: any; // nullable

    // These are set in the UI
    isSupported: boolean;
    notSupportedReason: string;
    hasAdditionalConfig: boolean;
    isEnabled: boolean; // for the flip-a-bit integrations
    isUpdating: boolean;
}

export interface RSSIntegration extends Integration {
    feeds: string[];
    immutableFeeds: { url: string, ownerId: string }[];
}

export interface TravisCiIntegration extends Integration {
    repoTemplates: { repoKey: string, template: string, newTemplate: string }[]; // newTemplate is local
    immutableRepoTemplates: { repoKey: string, template: string, ownerId: string }[];
    webhookUrl: string; // immutable
}

export interface IRCIntegration extends Integration {
    availableNetworks: { name: string, id: string }[];
    channels: { [networkId: string]: string[] };
}

export interface EtherpadWidgetIntegration extends Integration {
    defaultUrl: string;
}

export interface JitsiWidgetIntegration extends Integration {
    jitsiDomain: string;
    scriptUrl: string
}