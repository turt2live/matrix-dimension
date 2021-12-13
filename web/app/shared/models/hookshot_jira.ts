export interface FE_HookshotJiraBridge {
    id: number;
    upstreamId?: number;
    provisionUrl?: string;
    sharedSecret?: string;
    isEnabled: boolean;
}

export interface FE_HookshotJiraConnection {
    config: {
        url: string;
        commandPrefix?: string;
    };
}

export interface FE_HookshotJiraInstance {
    name: string;
    url: string;
}

export interface FE_HookshotJiraProject {
    key: string;
    name: string;
    url: string;
}
