export enum HookshotTypes {
    Github = "uk.half-shot.matrix-hookshot.github.repository",
    Jira = "uk.half-shot.matrix-hookshot.jira.project",
    Webhook = "uk.half-shot.matrix-hookshot.generic.hook",
}

export interface HookshotConnection {
    type: string;
    eventType: string; // state key in the connection
    id: string;
    service: string; // human-readable
    botUserId: string;
    config: any; // context-specific
}

export type HookshotConnectionsResponse = HookshotConnection[];

export interface HookshotConnectionTypeDefinition {
    type: string; // name of connection
    eventType: string; // state key in the connection
    service: string; // human-readable
    botUserId: string;
}

export interface HookshotGithubRoomConfig extends HookshotConnection {
    config: {
        org: string;
        repo: string;
        ignoreHooks: SupportedGithubRepoEventType[];
        commandPrefix: string;
    };
}

export interface HookshotGithubOrg {
    name: string;
    avatarUrl: string;
}

export interface HookshotGithubRepo {
    name: string;
    owner: string;
    fullName: string;
    avatarUrl: string;
    description: string;
}

export interface HookshotGithubUserInfo {
    loggedIn: boolean;
    organisations?: HookshotGithubOrg[];
}

export interface HookshotGithubAuthUrls {
    userUrl: string;
    orgUrl: string;
}

export enum SupportedGithubRepoEventType {
    IssueCreated = "issue.created",
    IssueChanged = "issue.changed",
    IssueEdited = "issue.edited",
    Issue = "issue",
    PROpened = "pull_request.opened",
    PRClosed = "pull_request.closed",
    PRMerged = "pull_request.merged",
    PRReadyForReview = "pull_request.ready_for_review",
    PRReviewed = "pull_request.reviewed",
    PR = "pull_request",
    ReleaseCreated = "release.created",
    Release = "release",
}

export interface HookshotJiraRoomConfig extends HookshotConnection {
    config: {
        url: string;
        events: SupportedJiraEventType[];
        commandPrefix: string;
    };
}

export enum SupportedJiraEventType {
    IssueCreated = "issue.created",
}

export interface HookshotJiraUserInfo {
    loggedIn: boolean;
    instances?: HookshotJiraInstance[];
}

export interface HookshotJiraInstance {
    name: string;
    url: string;
}

export interface HookshotJiraProject {
    key: string;
    name: string;
    url: string;
}

export interface HookshotWebhookRoomConfig extends HookshotConnection {
    config: {};
}
