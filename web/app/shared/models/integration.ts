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

export interface FE_SimpleBot extends FE_Integration {
    userId: string;
}

export interface FE_ComplexBot<T> extends FE_Integration {
    notificationUserId: string;
    botUserId?: string;
    config: T;
}

export interface FE_Bridge<T> extends FE_Integration {
    config: T;
}

export interface FE_StickerPack extends FE_Integration {
    id: number;
    author: {
        type: "none" | "twitter" | "mx-user";
        name: string;
        reference: string;
    };
    license: {
        name: string;
        urlPath: string;
    };
    stickers: FE_Sticker[];
}

export interface FE_UserStickerPack extends FE_StickerPack {
    isSelected: boolean;
}

export interface FE_Sticker {
    id: number;
    name: string;
    description: string;
    image: {
        mxc: string;
        mimetype: string;
    };
    thumbnail: {
        mxc: string;
        width: number;
        height: number;
    };
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
        useDomainAsDefault: boolean;
    };
}

export interface FE_IntegrationRequirement {
    condition: "publicRoom" | "canSendEventTypes" | "userInRoom";
    argument: any;
    expectedValue: any;
}