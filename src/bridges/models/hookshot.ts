export interface HookshotConnection {
    type: string;
    id: string;
    service: string; // human-readable
    details: any; // context-specific
}

export type HookshotConnectionsResponse = HookshotConnection[];

export interface HookshotGithubRoomConfig {

}

export enum HookshotTypes {
    Github = "uk.half-shot.matrix-hookshot.github.repository",
}
