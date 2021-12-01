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

export interface HookshotGithubRoomConfig {

}

export enum SupportedJiraEventType {
    IssueCreated = "issue.created",
}

export interface HookshotJiraRoomConfig {
    id: string;
    url: string;
    events: SupportedJiraEventType[];
    commandPrefix: string;
}

export enum HookshotTypes {
    Github = "uk.half-shot.matrix-hookshot.github.repository",
    Jira = "uk.half-shot.matrix-hookshot.jira.project",
}
