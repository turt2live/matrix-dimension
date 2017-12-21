export interface LegacyIntegration {
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

export interface RSSIntegration extends LegacyIntegration {
    feeds: string[];
    immutableFeeds: { url: string, ownerId: string }[];
}

export interface TravisCiIntegration extends LegacyIntegration {
    repoTemplates: { repoKey: string, template: string, newTemplate: string }[]; // newTemplate is local
    immutableRepoTemplates: { repoKey: string, template: string, ownerId: string }[];
    webhookUrl: string; // immutable
}

export interface CircleCiIntegration extends LegacyIntegration {
    repoTemplates: { repoKey: string, template: string, newTemplate: string }[]; // newTemplate is local
    immutableRepoTemplates: { repoKey: string, template: string, ownerId: string }[];
    webhookUrl: string; // immutable
}

export interface IRCIntegration extends LegacyIntegration {
    availableNetworks: { name: string, id: string }[];
    channels: { [networkId: string]: string[] };
}

export interface EtherpadWidgetIntegration extends LegacyIntegration {
    defaultUrl: string;
}

export interface JitsiWidgetIntegration extends LegacyIntegration {
    jitsiDomain: string;
    scriptUrl: string
}