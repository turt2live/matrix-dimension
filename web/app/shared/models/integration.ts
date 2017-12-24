export interface FE_Integration {
    category: "bot" | "complex-bot" | "bridge" | "widget";
    type: string;
    requirements: FE_IntegrationRequirement[];
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

export interface FE_Widget extends FE_Integration {
    options: any;
}

export interface FE_EtherpadWidget extends FE_Widget {
    options: {
        defaultUrl: string;
    };
}

export interface FE_JitsiWidget extends FE_Widget {
    options: {
        jitsiDomain: string;
        scriptUrl: string;
    };
}

export interface FE_IntegrationRequirement {
    condition: "publicRoom" | "canSendEventTypes";
    argument: any;
    expectedValue: any;
}