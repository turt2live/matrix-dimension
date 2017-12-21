export interface Integration {
    category: "bot" | "complex-bot" | "bridge" | "widget";
    type: string;
    requirements: IntegrationRequirement[];
    isEncryptionSupported: boolean;
    displayName: string;
    avatarUrl: string;
    description: string;
    isEnabled: boolean;
    isPublic: boolean;

    // Used by us
    _inRoom: boolean;
    _isUpdating: boolean;
    _isSupported: boolean;
    _notSupportedReason: string;
}

export interface Widget extends Integration {
    options: any;
}

export interface EtherpadWidget extends Widget {
    options: {
        defaultUrl: string;
    };
}

export interface JitsiWidget extends Widget {
    options: {
        jitsiDomain: string;
        scriptUrl: string;
    };
}

export interface IntegrationRequirement {
    condition: "publicRoom" | "canSendEventTypes";
    argument: any;
    expectedValue: any;
}