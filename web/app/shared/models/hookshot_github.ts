export interface FE_HookshotGithubBridge {
    id: number;
    upstreamId?: number;
    provisionUrl?: string;
    sharedSecret?: string;
    isEnabled: boolean;
}

export interface FE_HookshotGithubConnection {
    config: {
        org: string;
        repo: string;
        commandPrefix?: string;
    };
}

export interface FE_HookshotGithubRepo {
    name: string;
    owner: string;
    fullName: string;
    avatarUrl: string;
    description: string;
}

export interface FE_HookshotGithubAuthUrls {
    userUrl: string;
    orgUrl: string;
}

export interface FE_HookshotGithubOrg {
    name: string;
    avatarUrl: string;
}

export interface FE_HookshotGithubOrgReposDto {
    organization: FE_HookshotGithubOrg;
    repositories: FE_HookshotGithubRepo[];
    changeSelectionUrl?: string;
}
